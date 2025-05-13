import { Inject, Injectable } from '@nestjs/common';
import { STDL, VTASK } from '../../infra/infra.tokens.js';
import { exitCmd, ExitCmd } from '../spec/event.schema.js';
import { RecorderStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlDoneMessage, StdlDoneStatus, Vtask } from '../../infra/vtask/types.js';
import { log } from 'jslog';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { liveNodeAttr } from '../../common/attr/attr.live.js';
import { delay } from '../../utils/time.js';
import { stacktrace } from '../../utils/errors/utils.js';
import { LiveFinder } from '../data/live.finder.js';
import assert from 'assert';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { LiveWriter } from '../data/live.writer.js';
import { db } from '../../infra/db/db.js';

interface TargetRecorder {
  status: RecorderStatus;
  node: NodeDto;
}

interface NodeStats {
  node: NodeDto;
  statusList: RecorderStatus[];
}

export const liveFinishRequest = z.object({
  liveId: uuid,
  exitCmd: exitCmd,
  isPurge: z.boolean(),
  msg: z.string(),
});
export type LiveFinishRequest = z.infer<typeof liveFinishRequest>;

const TASK_WAIT_INTERVAL_MS = 1000; // 1 sec
const RECORDING_CLOSE_WAIT_TIMEOUT_MS = 60 * 1000; // 1 min
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 3000; // 3 sec

@Injectable()
export class LiveFinalizer {
  constructor(
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(VTASK) private readonly vtask: Vtask,
    @Inject(ENV) private readonly env: Env,
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
  ) {}

  async cancelRecorder(live: LiveDto, node: NodeDto): Promise<TargetRecorder | null> {
    const recStatus = await this.stdl.findStatus(node.endpoint, live.id);
    if (!recStatus) {
      log.debug(`Live already finished`, liveNodeAttr(live, node));
      return null;
    }

    // Close recorder
    log.debug('Close recorder', liveNodeAttr(live, node));
    await this.stdl.cancelRecording(node.endpoint, recStatus.id);

    return { status: recStatus, node };
  }

  async requestFinishLive(req: LiveFinishRequest) {
    const res = await fetch(`${this.env.appEndpoint}/api/lives/tasks/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(liveFinishRequest.parse(req)),
      signal: AbortSignal.timeout(this.env.httpTimeout),
    });
    if (res.status >= 400) {
      throw new HttpRequestError(`Failed to finish live`, res.status);
    }
  }

  async finishLive(req: LiveFinishRequest) {
    for (let retryCnt = 0; retryCnt < RETRY_LIMIT; retryCnt++) {
      const live = await this.liveFinder.findById(req.liveId, { nodes: true });
      if (!live) {
        log.error(`Live not found`, { liveId: req.liveId });
        return;
      }

      try {
        await this._finishLive(live, req.exitCmd);
        await db.transaction(async (tx) => {
          const live = await this.liveFinder.findById(req.liveId, { forUpdate: true }, tx);
          // LiveCleaner may have already removed live
          if (live) {
            const deleted = await this.liveWriter.delete(live.id, true, req.isPurge, tx);
            log.info(req.msg, { ...liveNodeAttr(deleted), cmd: req.exitCmd });
          }
        });
        return;
      } catch (e) {
        if (retryCnt === RETRY_LIMIT) {
          log.error(`Failed to finish live`, { ...liveNodeAttr(live), stacktrace: stacktrace(e) });
          return;
        }
        log.warn(`Retrying to finish live`, {
          ...liveNodeAttr(live),
          cmd: req.exitCmd,
          attempt: retryCnt + 1,
          stacktrace: stacktrace(e),
        });
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  private async _finishLive(live: LiveDtoWithNodes, cmd: ExitCmd) {
    assert(live.nodes);
    if (live.nodes.length === 0) {
      return;
    }

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
