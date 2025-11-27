import { Inject, Injectable } from '@nestjs/common';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { exitCmd, ExitCmd } from '../spec/event.schema.js';
import { RecordingStatus, Recnode } from '../../external/recnode/client/recnode.client.js';
import { log } from 'jslog';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { liveAttr } from '../../common/attr/attr.live.js';
import { delay } from '../../utils/time.js';
import { LiveFinder } from '../data/live.finder.js';
import assert from 'assert';
import { LiveDtoMapped } from '../spec/live.dto.schema.mapped.js';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveWriter } from '../data/live.writer.js';
import { db } from '../../infra/db/db.js';
import { HttpError } from '../../utils/errors/base/HttpError.js';
import { getHttpRequestError } from '../../utils/http.js';
import { SQSClient } from '../../external/sqs/sqs.client.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { Queue } from 'bullmq';
import { LIVE_FINISH_NAME } from '../../task/live/live.task.contants.js';
import { Redis } from 'ioredis';
import { getJobOpts } from '../../task/schedule/task.utils.js';

export const recnodeDoneStatusEnum = z.enum(['complete', 'canceled']);
export type RecnodeDoneStatus = z.infer<typeof recnodeDoneStatusEnum>;

export const recnodeDoneMessage = z.object({
  status: recnodeDoneStatusEnum,
  platform: platformNameEnum,
  uid: z.string().nonempty(),
  videoName: z.string().nonempty(),
  fsName: z.string().nonempty(),
});

export type RecnodeDoneMessage = z.infer<typeof recnodeDoneMessage>;

interface TargetRecorder {
  status: RecordingStatus;
  node: NodeDto;
}

interface NodeStats {
  node: NodeDto;
  statusList: RecordingStatus[];
}

export const liveFinishRequest = z.object({
  liveId: uuid,
  exitCmd: exitCmd,
  isPurge: z.boolean(),
});
export type LiveFinishRequest = z.infer<typeof liveFinishRequest>;

const WAIT_INTERVAL_MS = 1000; // 1 sec
const RETRY_LIMIT = 3;
const RETRY_DELAY_MS = 3000; // 3 sec

@Injectable()
export class LiveFinalizer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(TASK_REDIS) private readonly taskRedis: Redis,
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
    private readonly recnode: Recnode,
    private readonly sqs: SQSClient,
  ) {}

  async cancelRecorder(live: LiveDto, node: NodeDto): Promise<TargetRecorder | null> {
    try {
      const recStatus = await this.recnode.findStatus(node.endpoint, live.id);
      if (!recStatus) {
        log.debug(`Recording already finished`, liveAttr(live, { node }));
        return null;
      }

      log.debug('Cancel Recording', liveAttr(live, { node }));
      await this.recnode.cancelRecording(node.endpoint, recStatus.id);

      return { status: recStatus, node };
    } catch (err) {
      throw getHttpRequestError(`Failed to cancel recording`, err, liveAttr(live, { node, err }));
    }
  }

  async requestFinishLive(req: LiveFinishRequest) {
    const taskName = LIVE_FINISH_NAME;
    const queue = new Queue(taskName, { connection: this.taskRedis });
    await queue.add(taskName, { meta: {}, args: req }, getJobOpts(this.env));
  }

  async finishLive(req: LiveFinishRequest) {
    for (let retryCnt = 0; retryCnt <= RETRY_LIMIT; retryCnt++) {
      const live = await this.liveFinder.findById(req.liveId, { nodes: true });
      if (!live) {
        log.error(`Live not found`, { liveId: req.liveId });
        return;
      }

      try {
        if (this.env.nodeEnv === 'prod') {
          await this._finishLive(live, req.exitCmd);
        }
        await db.transaction(async (tx) => {
          const live = await this.liveFinder.findById(req.liveId, { forUpdate: true }, tx);
          // LiveCleaner may have already removed live
          if (live) {
            await this.liveWriter.update(live.id, { status: 'deleted' }, tx);
            await this.liveWriter.delete(live.id, req.isPurge, true, tx);
          }
        });
        return;
      } catch (err) {
        if (retryCnt === RETRY_LIMIT) {
          log.error(`Failed to finish live`, liveAttr(live, { err }));
          await this.liveWriter.delete(live.id, true, true);
          return;
        }
        log.warn(`Retrying to finish live`, {
          ...liveAttr(live, { err }),
          cmd: req.exitCmd,
          attempt: retryCnt + 1,
        });
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  private async _finishLive(live: LiveDtoMapped, cmd: ExitCmd) {
    assert(live.nodes);
    if (live.nodes.length === 0) {
      return;
    }

    // Cancel all recordings
    const cancelPromises = live.nodes.map((n) => this.cancelRecorder(live, n));
    const tgRecs: TargetRecorder[] = (await Promise.all(cancelPromises)).filter((r) => r !== null);

    // Validate fsName
    for (const rec of tgRecs) {
      if (live.fsName !== rec.status.fsName) {
        throw new ValidationError(`fsName mismatch: ${live.fsName} != ${rec.status.fsName}`);
      }
    }

    // Add RecnodeDone task
    if (cmd === 'delete') {
      return;
    }
    let doneCmd: RecnodeDoneStatus = 'complete';
    if (cmd === 'cancel') {
      doneCmd = 'canceled';
    } else if (cmd === 'finish') {
      doneCmd = 'complete';
    }
    const doneMsg: RecnodeDoneMessage = {
      status: doneCmd,
      platform: live.platform.name,
      uid: live.channel.sourceId,
      videoName: live.videoName,
      fsName: live.fsName,
    };

    log.debug(`Start adding RecnodeDone task`, liveAttr(live));

    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > this.env.liveFinishTimeoutSec * 1000) {
        const msg = `Timeout while waiting for recording to finish`;
        log.error(msg, liveAttr(live));
        throw new HttpError(msg, 500);
      }
      const isComplete = await this.isCompleteRecording(live, tgRecs);
      if (!isComplete) {
        await delay(WAIT_INTERVAL_MS);
        continue;
      }
      await this.sqs.send(JSON.stringify(doneMsg));
      break;
    }
    log.debug(`Complete adding RecnodeDone task`, liveAttr(live));
  }

  private async isCompleteRecording(live: LiveDto, tgRecs: TargetRecorder[]) {
    if (this.env.nodeEnv === 'dev') {
      return true;
    }

    const promises: Promise<NodeStats>[] = tgRecs.map(async (target) => {
      return { node: target.node, statusList: await this.recnode.getStatus(target.node.endpoint) };
    });
    for (const candidate of await Promise.all(promises)) {
      for (const status of candidate.statusList) {
        // if status exists
        if (status.id === live.id) {
          return false;
        }
      }
    }
    return true;
  }
}
