import { Inject, Injectable } from '@nestjs/common';
import { STDL, STDL_REDIS, VTASK } from '../../infra/infra.tokens.js';
import { ExitCmd } from '../spec/event.schema.js';
import { NodeRecorderStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlDoneMessage, StdlDoneStatus, Vtask } from '../../infra/vtask/types.js';
import { log } from 'jslog';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';

interface TargetRecorder {
  status: NodeRecorderStatus;
  node: NodeDto;
}

interface NodeStats {
  node: NodeDto;
  statusList: NodeRecorderStatus[];
}

@Injectable()
export class LiveDispatcher {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    @Inject(VTASK) private readonly vtask: Vtask,
  ) {}

  async cancelRecorder(live: LiveDto, node: NodeDto): Promise<TargetRecorder | null> {
    const statusList: NodeRecorderStatus[] = await this.stdl.getStatus(node.endpoint);
    const recStatus = statusList.find((status) => this.matchLiveAndStatus(live, status));
    if (!recStatus) {
      log.debug(`Live already finished`, { platform: live.platform.name, channelId: live.channel.pid });
      return null;
    }

    // Close recorder
    log.debug('Close recorder', { channelId: live.channel.pid });
    await this.stdl.cancelRecording(node.endpoint, recStatus.id);

    return { status: recStatus, node };
  }

  async finishLive(live: LiveDto, nodes: NodeDto[], cmd: ExitCmd) {
    const promises = nodes.map((n) => this.cancelRecorder(live, n));
    const tgRecs: TargetRecorder[] = (await Promise.all(promises)).filter((r) => r !== null);

    this.addVtask(live, tgRecs, cmd);
  }

  private addVtask(live: LiveDto, tgRecs: TargetRecorder[], cmd: ExitCmd) {
    // Validate fsName
    const fsName = tgRecs[0].status.fsName;
    for (let i = 1; i < tgRecs.length; i++) {
      const target = tgRecs[i];
      if (target.status.fsName !== fsName) {
        throw new ValidationError(`fsName mismatch: ${fsName} != ${target.status.fsName}`);
      }
    }

    // Create DoneMessage
    if (cmd === 'delete') {
      return;
    }
    let doneCmd: StdlDoneStatus = 'complete';
    if (cmd === 'cancel') {
      doneCmd = 'canceled';
    } else if (cmd === 'finish') {
      doneCmd = 'complete';
    }
    const doneMsg: StdlDoneMessage = {
      status: doneCmd,
      platform: live.platform.name,
      uid: live.channel.pid,
      videoName: live.videoName,
      fsName,
    };

    // Register StdlDone task
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    interval = setInterval(async () => {
      const isComplete = await this.checkVtask(live, tgRecs, doneMsg);
      if (isComplete) {
        log.debug(`Register StdlDone task`, { channelId: live.channel.pid });
        clearInterval(interval);
        interval = undefined;
        return;
      }
    }, 1000);
    setTimeout(() => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    }, 180 * 1000);
  }

  private async checkVtask(live: LiveDto, tgRecs: TargetRecorder[], doneMsg: StdlDoneMessage) {
    const promises: Promise<NodeStats>[] = tgRecs.map(async (target) => {
      return { node: target.node, statusList: await this.stdl.getStatus(target.node.endpoint) };
    });
    const latest = await Promise.all(promises);
    for (const candidate of latest) {
      for (const status of candidate.statusList) {
        if (this.matchLiveAndStatus(live, status)) {
          return false;
        }
      }
    }
    await this.vtask.addTask(doneMsg);
    await this.stdlRedis.delete(live.id);
    return true;
  }

  private matchLiveAndStatus(live: LiveDto, status: NodeRecorderStatus) {
    return (
      status.platform === live.platform.name &&
      status.channelId === live.channel.pid &&
      status.videoName === live.videoName
    );
  }
}
