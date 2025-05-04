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
import { delay } from '../../utils/time.js';
import { stacktrace } from '../../utils/errors/utils.js';
import { LiveFinder } from '../data/live.finder.js';
import assert from 'assert';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';

interface TargetRecorder {
  status: RecorderStatus;
  node: NodeDto;
}

interface NodeStats {
  node: NodeDto;
  statusList: RecorderStatus[];
}

const TASK_WAIT_INTERVAL_MS = 1000; // 1 sec
const RECORDING_CLOSE_WAIT_TIMEOUT_MS = 180 * 1000; // 3 min

@Injectable()
export class LiveFinalizer {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    @Inject(VTASK) private readonly vtask: Vtask,
    private readonly liveFinder: LiveFinder,
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

  async requestFinishLive(liveId: string, cmd: ExitCmd) {
    // fetch();
  }

  async finishLive(liveId: string, cmd: ExitCmd) {
    const live = await this.liveFinder.findById(liveId, { nodes: true });
    if (!live) {
      log.error(`Live not found`, { liveId, cmd });
      return;
    }

    try {
      await this._finishLive(live, cmd);
    } catch (e) {
      const attr = liveNodeAttr(live);
      attr.stacktrace = stacktrace(e);
      log.error(`Error while adding vtask`, attr);
    }
  }

  async _finishLive(live: LiveDtoWithNodes, cmd: ExitCmd) {
    assert(live.nodes);

    // Cancel all recorders
    const cancelPromises = live.nodes.map((n) => this.cancelRecorder(live, n));
    const tgRecs: TargetRecorder[] = (await Promise.all(cancelPromises)).filter((r) => r !== null);

    // Validate fsName
    for (const rec of tgRecs) {
      if (live.fsName !== rec.status.fsName) {
        throw new ValidationError(`fsName mismatch: ${live.fsName} != ${rec.status.fsName}`);
      }
    }

    // Add StdlDone task
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

    log.debug(`Start adding StdlDone task`, liveNodeAttr(live));

    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > RECORDING_CLOSE_WAIT_TIMEOUT_MS) {
        log.error(`Timeout while waiting for recording to finish`, liveNodeAttr(live));
        break;
      }
      const isComplete = await this.isCompleteRecording(live, tgRecs);
      if (!isComplete) {
        await delay(TASK_WAIT_INTERVAL_MS);
        continue;
      }
      await this.vtask.addTask(doneMsg);
      await this.stdlRedis.delete(live.id);
      break;
    }
    log.debug(`Complete adding StdlDone task`, liveNodeAttr(live));
  }

  private async isCompleteRecording(live: LiveDto, tgRecs: TargetRecorder[]) {
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
    return true;
  }
}
