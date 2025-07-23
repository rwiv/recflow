import { Inject, Injectable } from '@nestjs/common';
import assert from 'assert';
import { log } from 'jslog';
import { liveAttr } from '../../common/attr/attr.live.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { logging, LogLevel } from '../../utils/log.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveWriter } from '../data/live.writer.js';
import { ExitCmd } from '../spec/event.schema.js';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinalizer } from './live.finalizer.js';
import { LiveRegisterHelper, NodeSelectArgs } from './live.register-helper.js';

export interface LiveFinishRequest {
  recordId: string;
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  msg?: string;
  logLevel?: LogLevel;
}

export interface LiveRegisterRequest {
  live: LiveDtoWithNodes;

  node?: NodeDto;

  criterion?: CriterionDto;

  logMessage?: string;
  logLevel?: LogLevel;

  nodeSelect?: NodeSelectArgs;
}

@Injectable()
export class LiveRegistrar {
  constructor(
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    private readonly nodeSelector: NodeSelector,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
    private readonly finalizer: LiveFinalizer,
    private readonly helper: LiveRegisterHelper,
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

    if (!(await this.stdlRedis.getLiveState(live.id, false))) {
      await this.stdlRedis.createLiveState(live);
    }
    await this.stdl.startRecording(node.endpoint, live.id);

    // Send notification
    if (live.channel.priority.shouldNotify) {
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

  async finishLive(req: LiveFinishRequest): Promise<LiveDto | null> {
    const recordId = req.recordId;
    const isPurge = req.isPurge ?? false;
    const logLevel = req.logLevel ?? 'info';
    let exitCmd = req.exitCmd ?? 'delete';
    let msg = req.msg ?? 'Delete live';
    if (!req.msg && !isPurge) {
      msg = 'Disable live';
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
      logging(msg, { ...liveAttr(deleted), cmd: exitCmd }, logLevel);
      return deleted;
    }

    if (live.deletedAt) {
      log.warn('Live is already finished', liveAttr(live));
      return null;
    }
    await this.liveWriter.update(live.id, { status: 'finalizing' });
    await this.liveWriter.disable(live.id, false, true); // if Live is not disabled, it will become a recovery target and cause an error
    await this.finalizer.requestFinishLive({ liveId: live.id, exitCmd, isPurge, msg, logLevel });
    logging(msg, { ...liveAttr(live), cmd: exitCmd }, logLevel);
    return live; // not delete live record
  }
}
