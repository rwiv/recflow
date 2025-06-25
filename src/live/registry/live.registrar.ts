import { Inject, Injectable } from '@nestjs/common';
import assert from 'assert';
import { log } from 'jslog';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { PriorityService } from '../../channel/service/priority.service.js';
import { ChannelAppendWithInfo, ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { DEFAULT_PRIORITY_NAME } from '../../channel/spec/priority.constants.js';
import { liveAttr, liveInfoAttr } from '../../common/attr/attr.live.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { Notifier } from '../../infra/notify/notifier.js';
import type { Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { NodeSelector, NodeSelectorOptions } from '../../node/service/node.selector.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { Stlink, StreamInfo } from '../../platform/stlink/stlink.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { logging, LogLevel } from '../../utils/log.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveCreateOptions, LiveWriter } from '../data/live.writer.js';
import { ExitCmd } from '../spec/event.schema.js';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinalizer } from './live.finalizer.js';

export interface LiveFinishOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  msg?: string;
  logLevel?: LogLevel;
}

export interface LiveRegisterRequest {
  channelInfo: ChannelLiveInfo;
  reusableLive?: LiveDtoWithNodes;
  logMessage?: string;
  logLevel?: LogLevel;

  // node selection options
  ignoreNodeIds?: string[];
  ignoreGroupIds?: string[];
  criterion?: CriterionDto;
  domesticOnly?: boolean;
  overseasFirst?: boolean;
  mustExistNode?: boolean;
}

@Injectable()
export class LiveRegistrar {
  constructor(
    private readonly nodeSelector: NodeSelector,
    private readonly nodeUpdater: NodeUpdater,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly priService: PriorityService,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
    private readonly finalizer: LiveFinalizer,
    private readonly stlink: Stlink,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
  ) {}

  async register(req: LiveRegisterRequest): Promise<string | null> {
    const liveInfo = req.channelInfo.liveInfo;

    // Check if the live is accessible
    const { platform, pid } = req.channelInfo;
    let withAuth = liveInfo.isAdult;
    if (req.criterion?.enforceCreds) {
      withAuth = true;
    }
    const streamInfo = await this.stlink.fetchStreamInfo(platform, pid, withAuth);
    if (!streamInfo.openLive) {
      log.debug('This live is inaccessible', liveInfoAttr(liveInfo));
      // live record is not created as it may normalize later
      return null;
    }
    if (!streamInfo.best || !streamInfo.headers) {
      log.error('Stream info is not available', liveInfoAttr(liveInfo));
      return null;
    }
    // If m3u8 is not available (e.g. standby mode in Soop)
    const m3u8 = await this.stlink.fetchM3u8(streamInfo.best.mediaPlaylistUrl, streamInfo.headers);
    if (!m3u8) {
      // If a live is created in a disabled, It cannot detect the situation where the live was set to standby and then reactivated in Soop
      log.warn('M3U8 not available', liveInfoAttr(liveInfo));
      return null;
    }

    // If channel is not registered, create a new channel
    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type);
    if (!channel) {
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = { priorityId: none.id, isFollowed: false };
      channel = await this.chWriter.createWithInfo(append, req.channelInfo);
    }

    return db.transaction(async (tx) => {
      return this.registerWithTx(req, channel, streamInfo, tx);
    });
  }

  private async registerWithTx(
    req: LiveRegisterRequest,
    channel: ChannelDto,
    streamInfo: StreamInfo,
    tx: Tx,
  ): Promise<string | null> {
    let live = req.reusableLive;
    const cr = req.criterion;
    const liveInfo = req.channelInfo.liveInfo;
    const mustExistNode = req.mustExistNode ?? true;
    let logMessage = req.logMessage ?? 'New LiveNode';
    const logLevel = req.logLevel ?? 'info';

    if (cr?.loggingOnly) {
      const headMessage = 'New Logging Only Live';
      const createOpts: LiveCreateOptions = { isDisabled: true, domesticOnly: false, overseasFirst: false };
      return this.createDisabledLive(live, liveInfo, createOpts, headMessage, false, cr, tx);
    }

    const selectOpts = this.getNodeSelectOpts(req, live, channel);
    const { domesticOnly, overseasFirst } = selectOpts;
    let node = await this.nodeSelector.match(selectOpts, tx);
    if (!channel.priority.shouldSave) {
      node = null;
    }
    // If there is no available node
    if (!node) {
      const headMessage = 'No available nodes for assignment';
      if (mustExistNode) {
        const createOpts: LiveCreateOptions = { isDisabled: true, domesticOnly, overseasFirst };
        return this.createDisabledLive(live, liveInfo, createOpts, headMessage, true, cr, tx);
      } else {
        log.error(headMessage, liveInfoAttr(liveInfo));
        return null;
      }
    }

    // Create live if not exists
    if (!live) {
      logMessage = 'New Live';
      const createOpts: LiveCreateOptions = { isDisabled: false, domesticOnly, overseasFirst };
      live = await this.liveWriter.createByLive(liveInfo, streamInfo, createOpts, tx);
    }

    // Set node
    await this.liveWriter.bind(live.id, node.id, tx);
    await this.nodeUpdater.setLastAssignedAtNow(node.id, tx);
    if (!(await this.stdlRedis.getLiveState(live.id, false))) {
      await this.stdlRedis.createLiveState(live);
    }
    await this.stdl.startRecording(node.endpoint, live.id);

    // Send notification
    if (live.channel.priority.shouldNotify) {
      this.notifier.sendLiveInfo(live);
    }

    const attr = {
      ...liveAttr(live, { cr, node }),
      stream_url: streamInfo?.best?.mediaPlaylistUrl,
    };
    logging(logMessage, attr, logLevel);
    return live.id;
  }

  private async createDisabledLive(
    live: LiveDto | undefined,
    liveInfo: LiveInfo,
    createOpts: LiveCreateOptions,
    headMessage: string,
    withNotify: boolean,
    cr: CriterionDto | undefined,
    tx: Tx,
  ) {
    if (live) {
      const msg = 'Live already exists, but will be disabled';
      await this.finishLive(live.id, { exitCmd: 'finish', isPurge: true, msg, logLevel: 'warn' });
    }
    createOpts.isDisabled = true;
    const newDisabledLive = await this.liveWriter.createByLive(liveInfo, null, createOpts, tx);

    if (withNotify) {
      const messageFields = `channel=${liveInfo.channelName}, views=${liveInfo.viewCnt}, title=${liveInfo.liveTitle}`;
      this.notifier.notify(`${headMessage}: ${messageFields}`);
    }

    log.info(headMessage, liveAttr(newDisabledLive, { cr }));
    return newDisabledLive.id;
  }

  async deregister(live: LiveDto, node: NodeDto, tx: Tx = db) {
    await this.liveWriter.unbind(live.id, node.id, tx);
    await this.finalizer.cancelRecorder(live, node);
    log.debug('Deregister node in live', liveAttr(live, { node }));
  }

  async finishLive(recordId: string, opts: LiveFinishOptions = {}) {
    const isPurge = opts.isPurge ?? false;
    let exitCmd = opts.exitCmd ?? 'delete';
    const logLevel = opts.logLevel ?? 'info';
    let msg = opts.msg ?? 'Delete live';
    if (!opts.msg && !isPurge) {
      msg = 'Disable live';
    }

    const live = await this.liveFinder.findById(recordId, { nodes: true });
    if (!live) throw NotFoundError.from('LiveRecord', 'id', recordId);
    assert(live.nodes);
    if (live.nodes.length === 0) {
      exitCmd = 'delete';
    }

    // If exitCmd != delete, request live finish operation by http
    if (exitCmd !== 'delete') {
      await this.liveWriter.disable(live.id, false); // if Live is not disabled, it will become a recovery target and cause an error
      await this.finalizer.requestFinishLive({ liveId: live.id, exitCmd, isPurge, msg });
      return live; // not delete live record
    }

    // Else Delete live record
    return db.transaction(async (tx) => {
      const deleted = await this.liveWriter.delete(recordId, isPurge, tx);
      logging(msg, { ...liveAttr(deleted), cmd: exitCmd }, logLevel);
      return deleted;
    });
  }

  private getNodeSelectOpts(
    req: LiveRegisterRequest,
    live: LiveDtoWithNodes | undefined,
    channel: ChannelDto,
  ): NodeSelectorOptions {
    let domesticOnly = false;
    if (req.criterion) {
      domesticOnly = req.criterion.domesticOnly;
    }
    if (live) {
      domesticOnly = live.domesticOnly;
    }
    if (req.domesticOnly !== undefined) {
      domesticOnly = req.domesticOnly;
    }

    let overseasFirst = channel.overseasFirst;
    if (req.criterion) {
      overseasFirst = req.criterion.overseasFirst;
    }
    if (live) {
      overseasFirst = live.overseasFirst;
    }
    if (req.overseasFirst !== undefined) {
      overseasFirst = req.overseasFirst;
    }

    const opts: NodeSelectorOptions = { ignoreNodeIds: [], ignoreGroupIds: [], domesticOnly, overseasFirst };
    if (req.ignoreGroupIds) {
      opts.ignoreGroupIds = [...req.ignoreGroupIds];
    }
    if (req.ignoreNodeIds) {
      opts.ignoreNodeIds = [...req.ignoreNodeIds];
    }
    if (live && live.nodes) {
      opts.ignoreNodeIds = [...opts.ignoreNodeIds, ...live.nodes.map((node) => node.id)];
    }

    return opts;
  }
}
