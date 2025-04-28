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

interface Target {
  node: NodeDto;
  status: NodeRecorderStatus;
}

interface Candidate {
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

    const promises: Promise<Candidate>[] = nodes.map(async (node) => {
      return { node, statusList: await this.stdl.getStatus(node.endpoint) };
    });
    const candidates = await Promise.all(promises);
    const targets: Target[] = [];
    for (const candidate of candidates) {
      const status = candidate.statusList.find((status) => this.matchLiveAndStatus(live, status));
      if (!status) {
        log.info(`Live already finished`, { platform, channelId: pid });
        return;
      } else {
        targets.push({ node: candidate.node, status });
      }
    }

    if (targets.length === 0) {
      return;
    }
    const fsName = targets[0].status.fsName;
    for (let i = 1; i < targets.length; i++) {
      const target = targets[i];
      if (target.status.fsName !== fsName) {
        throw new ValidationError(`fsName mismatch: ${fsName} != ${target.status.fsName}`);
      }
    }
    await Promise.all(targets.map((t) => this.stdl.cancel(t.node.endpoint, t.status.id)));

    if (cmd === 'delete') {
      return;
    }
    let doneCmd: StdlDoneStatus = 'complete';
    if (cmd === 'cancel') {
      doneCmd = 'canceled';
    }
    const doneMsg: StdlDoneMessage = {
      status: doneCmd,
      platform,
      uid: pid,
      videoName: live.videoName,
      fsName,
    };

    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    interval = setInterval(async () => {
      const isComplete = await this.checkVtask(live, targets, doneMsg);
      if (isComplete) {
        log.debug(`Add StdlDone task`, { channelId: live.channel.pid });
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

  async checkVtask(live: LiveDto, targets: Target[], doneMsg: StdlDoneMessage) {
    const promises: Promise<Candidate>[] = targets.map(async (target) => {
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
