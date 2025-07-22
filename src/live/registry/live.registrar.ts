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
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import type { Stdl } from '../../infra/stdl/stdl.client.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { NodeSelector, NodeSelectorOptions } from '../../node/service/node.selector.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import { logging, LogLevel } from '../../utils/log.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveCreateArgs, LiveWriter } from '../data/live.writer.js';
import { ExitCmd } from '../spec/event.schema.js';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { LiveDto, LiveStreamDto, StreamInfo } from '../spec/live.dto.schema.js';
import { LiveFinalizer } from './live.finalizer.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { LiveStreamService } from '../data/live-stream.service.js';
import { LiveStreamQuery } from '../storage/live.stream.repository.js';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

export interface LiveFinishOptions {
  recordId: string;
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  msg?: string;
  logLevel?: LogLevel;
}

export interface NodeSelectArgs {
  ignoreNodeIds?: string[];
  ignoreGroupIds?: string[];
  domesticOnly?: boolean;
  overseasFirst?: boolean;
}

export interface NewLiveCreationRequest {
  channelInfo: ChannelLiveInfo;

  isFollowed?: boolean;
  criterionId?: string;

  logMessage?: string;
  logLevel?: LogLevel;

  stream?: StreamInfo;
}

export interface LiveNodeRegisterRequest {
  channelInfo: ChannelLiveInfo;

  isFollowed?: boolean;
  criterion?: CriterionDto;

  logMessage?: string;
  logLevel?: LogLevel;

  stream?: StreamInfo;

  reusableLive?: LiveDtoWithNodes;

  mustExistNode?: boolean;
  node?: NodeSelectArgs;
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
    private readonly liveStreamService: LiveStreamService,
    private readonly finalizer: LiveFinalizer,
    private readonly crFinder: CriterionFinder,
    private readonly stlink: Stlink,
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
  ) {}

  async getLiveStream(
    req: LiveNodeRegisterRequest,
    liveInfo: LiveInfo,
    channel: ChannelDto,
  ): Promise<LiveStreamDto | null> {
    const query: LiveStreamQuery = { sourceId: liveInfo.liveId, channelId: channel.id };
    const exists = await this.liveStreamService.findByQueryLatestOne(query);
    if (exists) return exists;

    if (req.stream) {
      return await this.liveStreamService.createBy({
        sourceId: liveInfo.liveId,
        channelId: channel.id,
        streamInfo: req.stream,
      });
    }

    // Check if the live is accessible
    let withAuth = liveInfo.isAdult;
    if (req.isFollowed && this.env.stlink.enforceAuthForFollowed) {
      withAuth = true;
    }
    if (req.criterion?.enforceCreds) {
      withAuth = true;
    }
    const { platform, pid } = req.channelInfo;
    const stRes = await this.stlink.fetchStreamInfo(platform, pid, withAuth);
    if (!stRes.openLive) {
      log.debug('This live is inaccessible', liveInfoAttr(liveInfo));
      // live record is not created as it may normalize later
      return null;
    }
    if (!stRes.best || !stRes.headers) {
      log.error('Stream info is not available', liveInfoAttr(liveInfo));
      return null;
    }

    const streamUrl = stRes?.best?.mediaPlaylistUrl;
    const streamHeaders = stRes?.headers;
    if (!streamUrl || !streamHeaders) {
      throw new ValidationError('Stream info is not available');
    }
    return await this.liveStreamService.createBy({
      sourceId: liveInfo.liveId,
      channelId: channel.id,
      streamInfo: { url: streamUrl, headers: streamHeaders, params: stRes?.best?.params ?? null },
    });
  }

  async createNewLive(req: NewLiveCreationRequest): Promise<string | null> {
    let criterion = undefined;
    if (req.criterionId) {
      criterion = await this.crFinder.findById(req.criterionId);
      if (!criterion) {
        throw NotFoundError.from('Criterion', 'id', req.criterionId);
      }
    }
    const newReq: LiveNodeRegisterRequest = {
      ...req,
      criterion,
    };
    return this.registerLiveNode(newReq);
  }

  async registerLiveNode(req: LiveNodeRegisterRequest): Promise<string | null> {
    const liveInfo = req.channelInfo.liveInfo;

    // If channel is not registered, create a new channel
    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type);
    if (!channel) {
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = { priorityId: none.id, isFollowed: false };
      channel = await this.chWriter.createWithInfo(append, req.channelInfo);
    }

    const liveStream = await this.getLiveStream(req, liveInfo, channel);
    if (!liveStream) return null;

    // TODO: remove
    // // If m3u8 is not available (e.g. standby mode in Soop)
    // const m3u8 = await this.stlink.fetchM3u8(streamUrl, headers);
    // if (!m3u8) {
    //   // If a live is created in a disabled, It cannot detect the situation where the live was set to standby and then reactivated in Soop
    //   log.warn('M3U8 not available', liveInfoAttr(liveInfo));
    //   return null;
    // }

    return db.transaction(async (tx) => {
      return this.registerWithTx(req, channel, liveStream, tx);
    });
  }

  private async registerWithTx(
    req: LiveNodeRegisterRequest,
    channel: ChannelDto,
    stream: LiveStreamDto,
    tx: Tx,
  ): Promise<string | null> {
    let live = req.reusableLive;
    const cr = req.criterion;
    const liveInfo = req.channelInfo.liveInfo;
    const mustExistNode = req.mustExistNode ?? true;
    let logMessage = req.logMessage ?? 'New LiveNode';

    if (cr?.loggingOnly) {
      const headMessage = 'New Logging Only Live';
      return this.createDisabledLive(liveInfo, channel, live, headMessage, false, cr, tx);
    }

    const selectOpts = this.getNodeSelectOpts(req.node ?? {}, channel, live, cr);
    const { domesticOnly, overseasFirst } = selectOpts;
    let node = await this.nodeSelector.match(selectOpts, tx);
    if (!channel.priority.shouldSave) {
      node = null;
    }
    // If there is no available node
    if (!node) {
      const headMessage = 'No available nodes for assignment';
      if (mustExistNode) {
        return this.createDisabledLive(liveInfo, channel, live, headMessage, true, cr, tx);
      } else {
        log.error(headMessage, liveInfoAttr(liveInfo));
        return null;
      }
    }

    // Create live if not exists
    if (!live) {
      logMessage = 'New Live';
      const args: LiveCreateArgs = {
        liveInfo: req.channelInfo.liveInfo,
        fields: {
          channelId: channel.id,
          isDisabled: false,
          domesticOnly,
          overseasFirst,
          liveStreamId: stream.id,
        },
      };
      live = await this.liveWriter.createByLive(args, tx);
    }

    // Set node
    await this.liveWriter.bind({ liveId: live.id, nodeId: node.id }, tx);
    await this.nodeUpdater.setLastAssignedAtNow(node.id, tx);
    if (!(await this.stdlRedis.getLiveState(live.id, false))) {
      await this.stdlRedis.createLiveState(live);
    }
    await this.stdl.startRecording(node.endpoint, live.id);

    // Send notification
    if (live.channel.priority.shouldNotify) {
      this.notifier.sendLiveInfo(live);
    }

    await this.liveWriter.update(live.id, { status: 'recording' }, tx);

    const attr = { ...liveAttr(live, { cr, node }), stream_url: stream.url };
    logging(logMessage, attr, req.logLevel ?? 'info');
    return live.id;
  }

  private async createDisabledLive(
    liveInfo: LiveInfo,
    channel: ChannelDto,
    existsLive: LiveDto | undefined,
    headMessage: string,
    withNotify: boolean,
    cr: CriterionDto | undefined,
    tx: Tx,
  ) {
    if (existsLive) {
      await this.finishLive({
        recordId: existsLive.id,
        exitCmd: 'finish',
        isPurge: true,
        msg: 'Live already exists, but will be disabled',
        logLevel: 'warn',
      });
    }
    const args: LiveCreateArgs = {
      liveInfo,
      fields: {
        channelId: channel.id,
        isDisabled: true,
        domesticOnly: false,
        overseasFirst: false,
        liveStreamId: null,
      },
    };
    const newDisabledLive = await this.liveWriter.createByLive(args, tx);

    const { channelName, viewCnt, liveTitle } = args.liveInfo;
    if (withNotify) {
      const messageFields = `channel=${channelName}, views=${viewCnt}, title=${liveTitle}`;
      this.notifier.notify(`${headMessage}: ${messageFields}`);
    }

    log.info(headMessage, liveAttr(newDisabledLive, { cr }));
    return newDisabledLive.id;
  }

  async deregister(live: LiveDto, node: NodeDto, tx: Tx = db) {
    await this.liveWriter.unbind({ liveId: live.id, nodeId: node.id }, tx);
    await this.finalizer.cancelRecorder(live, node);
    log.debug('Deregister node in live', liveAttr(live, { node }));
  }

  async finishLive(opts: LiveFinishOptions): Promise<LiveDto | null> {
    const recordId = opts.recordId;
    const isPurge = opts.isPurge ?? false;
    const logLevel = opts.logLevel ?? 'info';
    let exitCmd = opts.exitCmd ?? 'delete';
    let msg = opts.msg ?? 'Delete live';
    if (!opts.msg && !isPurge) {
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

  private getNodeSelectOpts(
    req: NodeSelectArgs,
    channel: ChannelDto,
    live: LiveDtoWithNodes | undefined,
    criterion: CriterionDto | undefined,
  ): NodeSelectorOptions {
    let domesticOnly = false;
    if (criterion) {
      domesticOnly = criterion.domesticOnly;
    }
    if (live) {
      domesticOnly = live.domesticOnly;
    }
    if (req.domesticOnly !== undefined) {
      domesticOnly = req.domesticOnly;
    }

    let overseasFirst = channel.overseasFirst;
    if (criterion) {
      overseasFirst = criterion.overseasFirst;
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
