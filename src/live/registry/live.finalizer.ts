import { Inject, Injectable } from '@nestjs/common';
import { STDL, STDL_REDIS, VTASK } from '../../infra/infra.tokens.js';
import { ExitCmd } from '../spec/event.schema.js';
import { RecorderStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlDoneMessage, StdlDoneStatus, Vtask } from '../../infra/vtask/types.js';
import { log } from 'jslog';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

interface TargetRecorder {
  status: RecorderStatus;
  node: NodeDto;
}

interface NodeStats {
  node: NodeDto;
  statusList: RecorderStatus[];
}

const RECORDING_CLOSE_WAIT_TIMEOUT = 180 * 1000; // 3 min

@Injectable()
export class LiveFinalizer {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    @Inject(VTASK) private readonly vtask: Vtask,
  ) {}

  async cancelRecorder(live: LiveDto, node: NodeDto): Promise<TargetRecorder | null> {
    const recStatus = await this.stdl.findStatus(node.endpoint, live.id);
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
    const cancelPromises = nodes.map((n) => this.cancelRecorder(live, n));
    const tgRecs: TargetRecorder[] = (await Promise.all(cancelPromises)).filter((r) => r !== null);

    this.addVtask(live, tgRecs, cmd);
  }

  private addVtask(live: LiveDto, tgRecs: TargetRecorder[], cmd: ExitCmd) {
    // Validate fsName
    for (const rec of tgRecs) {
      if (live.fsName !== rec.status.fsName) {
        throw new ValidationError(`fsName mismatch: ${live.fsName} != ${rec.status.fsName}`);
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
      fsName: live.fsName,
    };

    // Register StdlDone task
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    interval = setInterval(async () => {
      const isComplete = await this.checkVtask(live, tgRecs, doneMsg);
      if (isComplete) {
        log.debug(`Register StdlDone task`, liveNodeAttr(live));
        clearInterval(interval);
        interval = undefined;
        return;
      }
    }, 1000);

    // Stop interval after timeout
    setTimeout(() => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    }, RECORDING_CLOSE_WAIT_TIMEOUT);
  }

  private async checkVtask(live: LiveDto, tgRecs: TargetRecorder[], doneMsg: StdlDoneMessage) {
    const promises: Promise<NodeStats>[] = tgRecs.map(async (target) => {
      return { node: target.node, statusList: await this.stdl.getStatus(target.node.endpoint) };
    });
    const latest = await Promise.all(promises);
    for (const candidate of latest) {
      for (const status of candidate.statusList) {
        if (status.id === live.id) {
          // if status exists
          return false;
        }
      }
    }
    await this.vtask.addTask(doneMsg);
    await this.stdlRedis.delete(live.id);
    return true;
  }
}
