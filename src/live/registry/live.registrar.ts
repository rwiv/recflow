import { Inject, Injectable } from '@nestjs/common';
import { ExitCmd } from '../spec/event.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { NodeSelector, NodeSelectorOptions } from '../../node/service/node.selector.js';
import { ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { ChannelAppendWithInfo, ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveCreateOptions, LiveWriter } from '../data/live.writer.js';
import { LiveFinder } from '../data/live.finder.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { PriorityService } from '../../channel/service/priority.service.js';
import { DEFAULT_PRIORITY_NAME } from '../../channel/spec/priority.constants.js';
import { log } from 'jslog';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import type { Stdl } from '../../infra/stdl/stdl.client.js';
import { LiveFinalizer } from './live.finalizer.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { Stlink, StreamInfo } from '../../platform/stlink/stlink.js';
import { liveNodeAttr } from '../../common/attr/attr.live.js';
import assert from 'assert';
import { LiveInfo } from '../../platform/spec/wapper/live.js';

export interface LiveFinishOptions {
  isPurge?: boolean;
  exitCmd?: ExitCmd;
  msg?: string;
}

export interface LiveRegisterRequest {
  channelInfo: ChannelLiveInfo;
  reusableLive?: LiveDtoWithNodes;

  // node selection options
  ignoreNodeIds?: string[];
  ignoreGroupIds?: string[];
  criterion?: CriterionDto;
  domesticOnly?: boolean;
  overseasFirst?: boolean;
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
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
  ) {}

  async register(req: LiveRegisterRequest): Promise<string | null> {
    const liveInfo = req.channelInfo.liveInfo;

    // Check if the live is accessible
    const { platform, pid, username } = req.channelInfo;
    let useCred = liveInfo.isAdult;
    if (req.criterion?.enforceCreds) {
      useCred = true;
    }
    const streamInfo = await this.stlink.fetchStreamInfo(platform, pid, useCred);
    if (!streamInfo.openLive) {
      log.debug('This live is inaccessible', { platform, pid, username });
      // live record is not created as it may normalize later
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
      return this._register(req, channel, streamInfo, tx);
    });
  }

  private async _register(
    req: LiveRegisterRequest,
    channel: ChannelDto,
    streamInfo: StreamInfo,
    tx: Tx,
  ): Promise<string | null> {
    let live = req.reusableLive;
    const liveInfo = req.channelInfo.liveInfo;

    const selectOpts = this.getNodeSelectOpts(req, live, channel);
    const { domesticOnly, overseasFirst } = selectOpts;
    let node = await this.nodeSelector.match(selectOpts, tx);
    if (!channel.priority.shouldSave) {
      node = null;
    }

    // If there is no available node, notify and create a disabled live
    if (!node) {
      const createOpts: LiveCreateOptions = { isDisabled: true, domesticOnly, overseasFirst };
      const headMessage = 'No available nodes for assignment';
      return this.createDisabledLive(live, liveInfo, createOpts, headMessage, tx);
    }

    // If m3u8 is not available, create a disabled live
    if (streamInfo.best && streamInfo.headers) {
      const m3u8 = await this.stlink.fetchM3u8(streamInfo.best.mediaPlaylistUrl, streamInfo.headers);
      if (!m3u8) {
        const createOpts: LiveCreateOptions = { isDisabled: true, domesticOnly, overseasFirst };
        const headMessage = 'M3U8 not available';
        return this.createDisabledLive(live, liveInfo, createOpts, headMessage, tx);
      }
    }

    // Create live if not exists
    let logMsg = 'Change node in live';
    if (!live) {
      logMsg = 'New Live';
      const createOpts: LiveCreateOptions = { isDisabled: false, domesticOnly, overseasFirst };
      live = await this.liveWriter.createByLive(liveInfo, streamInfo, createOpts, tx);
    }

    // Set node
    await this.liveWriter.bind(live.id, node.id, tx);
    await this.nodeUpdater.setLastAssignedAtNow(node.id, tx);
    if (!(await this.stdlRedis.getLive(live.id))) {
      await this.stdlRedis.setLive(live);
    }
    await this.stdl.startRecording(node.endpoint, live.id);

    // Send notification
    if (live.channel.priority.shouldNotify) {
      this.notifier.sendLiveInfo(this.env.untf.topic, live);
    }

    log.info(logMsg, liveNodeAttr(live, node));
    return live.id;
  }

  private async createDisabledLive(
    live: LiveDto | undefined,
    liveInfo: LiveInfo,
    createOpts: LiveCreateOptions,
    headMessage: string,
    tx: Tx,
  ) {
    if (live) {
      await this.finishLive(live.id, { exitCmd: 'finish', isPurge: true });
    }
    createOpts.isDisabled = true;
    const newDisabledLive = await this.liveWriter.createByLive(liveInfo, null, createOpts, tx);

    const messageFields = `channel=${liveInfo.channelName}, views=${liveInfo.viewCnt}, title=${liveInfo.liveTitle}`;
    this.notifier.notify(this.env.untf.topic, `${headMessage}: ${messageFields}`);
    log.info(headMessage, liveNodeAttr(newDisabledLive));

    return newDisabledLive.id;
  }

  async deregister(live: LiveDto, node: NodeDto, tx: Tx = db) {
    await this.liveWriter.unbind(live.id, node.id, tx);
    await this.finalizer.cancelRecorder(live, node);
    log.debug('Deregister node in live', liveNodeAttr(live, node));
  }

  async finishLive(recordId: string, opts: LiveFinishOptions = {}) {
    const isPurge = opts.isPurge ?? false;
    let exitCmd = opts.exitCmd ?? 'delete';
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
      log.info(msg, { ...liveNodeAttr(deleted), cmd: exitCmd });
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
