import { Injectable } from '@nestjs/common';
import assert from 'assert';
import { log } from 'jslog';

import { LogLevel, logging } from '@/utils/log.js';

import { liveAttr } from '@/common/attr/attr.live.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { Notifier } from '@/external/notify/notifier.js';
import { Recnode } from '@/external/recnode/client/recnode.client.js';
import { RecnodeRedis } from '@/external/recnode/redis/recnode.redis.js';

import { CriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

import { NodeSelector } from '@/node/service/node.selector.js';
import { NodeDto } from '@/node/spec/node.dto.schema.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveWriter } from '@/live/data/live.writer.js';
import { LiveFinalizer } from '@/live/register/live.finalizer.js';
import { LiveRegisterHelper, NodeSelectArgs } from '@/live/register/live.register-helper.js';
import { ExitCmd } from '@/live/spec/event.schema.js';
import { LiveDto } from '@/live/spec/live.dto.schema.js';
import { LiveDtoMapped } from '@/live/spec/live.dto.schema.mapped.js';

export interface LiveFinishRequest {
  recordId: string;
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  logMsg?: string;
  logLevel?: LogLevel;
}

export interface LiveRegisterRequest {
  live: LiveDtoMapped;

  node?: NodeDto;

  criterion?: CriterionDto;

  logMessage?: string;
  logLevel?: LogLevel;

  nodeSelect?: NodeSelectArgs;
}

@Injectable()
export class LiveRegistrar {
  constructor(
    private readonly nodeSelector: NodeSelector,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
    private readonly finalizer: LiveFinalizer,
    private readonly helper: LiveRegisterHelper,
    private readonly recnode: Recnode,
    private readonly recnodeRedis: RecnodeRedis,
    private readonly notifier: Notifier,
  ) {}

  async register(req: LiveRegisterRequest): Promise<string | null> {
    return db.transaction(async (tx) => {
      return this._register(req, tx);
    });
  }

  private async _register(req: LiveRegisterRequest, tx: Tx): Promise<string | null> {
    const live = req.live;
    const channel = live.channel;
    let node = req.node ?? null;
    const cr = req.criterion;
    const logMessage = req.logMessage ?? 'New LiveNode';

    if (!node) {
      const selectArgs = this.helper.getNodeSelectArgs(req.nodeSelect ?? {}, channel, live, cr);
      node = await this.nodeSelector.match(selectArgs, db);
    }
    // If there is no available node
    if (!node) {
      log.error('No available nodes for assignment', liveAttr(live));
      return null;
    }
    await this.liveWriter.bind({ liveId: live.id, nodeId: node.id }, tx);

    if (!(await this.recnodeRedis.getLiveState(live.id, false))) {
      await this.recnodeRedis.createLiveState(live);
    }
    await this.recnode.startRecording(node.endpoint, live.id);

    // Send notification
    if (live.channel.grade.shouldNotify) {
      this.notifier.sendLiveInfo(live);
    }

    await this.liveWriter.update(live.id, { status: 'recording' }, tx);

    const attr = { ...liveAttr(live, { cr, node }), stream_url: live.stream?.url };
    logging(logMessage, attr, req.logLevel ?? 'info');
    return live.id;
  }

  async deregister(live: LiveDto, node: NodeDto, tx: Tx = db) {
    await this.liveWriter.unbind({ liveId: live.id, nodeId: node.id }, tx);
    await this.finalizer.cancelRecorder(live, node);
    log.debug('Deregister node in live', liveAttr(live, { node }));
  }

  async finishLive(req: LiveFinishRequest, tx: Tx = db): Promise<LiveDto | null> {
    const recordId = req.recordId;
    const isPurge = req.isPurge ?? false;
    const logLevel = req.logLevel ?? 'info';
    let exitCmd = req.exitCmd ?? 'delete';
    let logMsg = req.logMsg ?? 'Delete live';
    if (!req.logMsg && !isPurge) {
      logMsg = 'Disable live';
    }

    const live = await this.liveFinder.findById(recordId, { nodes: true });
    if (!live) {
      log.warn(`Failed to finish live: Not found LiveRecord: id=${recordId}`);
      return null;
    }
    assert(live.nodes);
    if (live.nodes.length === 0) {
      exitCmd = 'delete';
    }

    if (exitCmd === 'delete') {
      const deleted = await this.liveWriter.delete(recordId, isPurge, false);
      logging(logMsg, { ...liveAttr(deleted), cmd: exitCmd }, logLevel);
      return deleted;
    }

    if (live.deletedAt || live.status === 'finalizing' || live.status === 'deleted') {
      log.warn('Live is already finished', liveAttr(live));
      return null;
    }
    await tx.transaction(async (txx) => {
      await this.liveWriter.update(live.id, { status: 'finalizing' }, txx);
      await this.liveWriter.disable(live.id, false, true, txx); // if Live is not disabled, it will become a recovery target and cause an error
    });
    await this.finalizer.requestFinishLive({ liveId: live.id, exitCmd, isPurge });
    logging(logMsg, { ...liveAttr(live), cmd: exitCmd }, logLevel);
    return live; // not delete live record
  }
}
