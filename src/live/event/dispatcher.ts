import { Inject, Injectable } from '@nestjs/common';
import { STDL, STDL_REDIS, VTASK } from '../../infra/infra.tokens.js';
import { ExitCmd } from './event.schema.js';
import { NodeRecorderStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlDoneMessage, StdlDoneStatus, Vtask } from '../../infra/vtask/types.js';
import { log } from 'jslog';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';

interface TargetRecorder {
  node: NodeDto;
  status: NodeRecorderStatus;
}

interface CandidateNode {
  node: NodeDto;
  statusList: NodeRecorderStatus[];
}

@Injectable()
export class Dispatcher {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    @Inject(VTASK) private readonly vtask: Vtask,
  ) {}

  async sendExitMessage(live: LiveDto, nodes: NodeDto[], cmd: ExitCmd) {
    const platform = live.platform.name;
    const pid = live.channel.pid;

    // Find to be closed target live status list
    const promises: Promise<CandidateNode>[] = nodes.map(async (node) => {
      return { node, statusList: await this.stdl.getStatus(node.endpoint) };
    });
    const candidateNodes = await Promise.all(promises);
    const targetRecorders: TargetRecorder[] = [];
    for (const candidateNode of candidateNodes) {
      const recorderStatus = candidateNode.statusList.find((status) => this.matchLiveAndStatus(live, status));
      if (!recorderStatus) {
        log.debug(`Live already finished`, { platform, channelId: pid });
        return;
      } else {
        targetRecorders.push({ node: candidateNode.node, status: recorderStatus });
      }
    }

    // Validate fsName
    const fsName = targetRecorders[0].status.fsName;
    for (let i = 1; i < targetRecorders.length; i++) {
      const target = targetRecorders[i];
      if (target.status.fsName !== fsName) {
        throw new ValidationError(`fsName mismatch: ${fsName} != ${target.status.fsName}`);
      }
    }

    // Close recorder
    const promises2 = targetRecorders.map((t) => {
      log.debug('Close recorder', { channelId: t.status.channelId });
      return this.stdl.cancel(t.node.endpoint, t.status.id);
    });
    await Promise.all(promises2);

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
      platform,
      uid: pid,
      videoName: live.videoName,
      fsName,
    };

    // Register StdlDone task
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    interval = setInterval(async () => {
      const isComplete = await this.checkVtask(live, targetRecorders, doneMsg);
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

  private async checkVtask(live: LiveDto, targets: TargetRecorder[], doneMsg: StdlDoneMessage) {
    const promises: Promise<CandidateNode>[] = targets.map(async (target) => {
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
