import { Inject, Injectable } from '@nestjs/common';
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
import { NOTIFIER } from '../../infra/infra.tokens.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { NodeSelector } from '../../node/service/node.selector.js';
import { ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import { LogLevel } from '../../utils/log.js';
import { LiveCreateArgs, LiveWriter } from '../data/live.writer.js';
import { LiveDto, LiveStreamDto, StreamInfo } from '../spec/live.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { LiveStreamService } from '../stream/live-stream.service.js';
import { LiveStreamQuery } from '../storage/live.stream.repository.js';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveRegisterRequest, LiveRegistrar } from './live.registrar.js';
import { LiveRegisterHelper } from './live.register-helper.js';

export interface NewLiveRequest {
  channelInfo: ChannelLiveInfo;

  isFollowed?: boolean;
  criterionId?: string;

  logMessage?: string;
  logLevel?: LogLevel;

  stream?: StreamInfo;
}

@Injectable()
export class LiveInitializer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    private readonly stlink: Stlink,
    private readonly nodeSelector: NodeSelector,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly priService: PriorityService,
    private readonly liveWriter: LiveWriter,
    private readonly liveStreamService: LiveStreamService,
    private readonly registrar: LiveRegistrar,
    private readonly crFinder: CriterionFinder,
    private readonly helper: LiveRegisterHelper,
  ) {}

  async createNewLiveByLive(base: LiveDto): Promise<string | null> {
    if (!base.liveStreamId) {
      throw new ValidationError('LiveStreamId is not set', { attr: liveAttr(base) });
    }

    const live = await this.liveWriter.createByLive(base.id);
    const newReq: LiveRegisterRequest = {
      live,
      logMessage: 'New Same Live',
    };
    return this.registrar.register(newReq);
  }

  async createNewLive(req: NewLiveRequest): Promise<string | null> {
    const liveInfo = req.channelInfo.liveInfo;
    let cr = undefined;
    if (req.criterionId) {
      cr = await this.crFinder.findById(req.criterionId);
      if (!cr) {
        throw NotFoundError.from('Criterion', 'id', req.criterionId);
      }
    }

    let channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, liveInfo.type);
    if (!channel) {
      const none = await this.priService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = { priorityId: none.id, isFollowed: false };
      channel = await this.chWriter.createWithInfo(append, req.channelInfo);
    }

    if (cr?.loggingOnly) {
      const headMessage = 'New Logging Only Live';
      return this.createDisabledLive(liveInfo, channel, undefined, headMessage, false, cr);
    }

    const stream = await this.getLiveStream(req, liveInfo, channel);
    if (!stream) return null;

    // If m3u8 is not available (e.g. standby mode in Soop)
    // const m3u8 = await this.stlink.fetchM3u8(stream);
    // if (!m3u8) {
    //   // If a live is created in a disabled, It cannot detect the situation where the live was set to standby and then reactivated in Soop
    //   log.warn('M3U8 not available', liveInfoAttr(liveInfo));
    //   return null;
    // }

    const selectOpts = this.helper.getNodeSelectOpts({}, channel, undefined, cr);
    let node = await this.nodeSelector.match(selectOpts);
    if (!channel.priority.shouldSave) {
      node = null;
    }
    // If there is no available node
    if (!node) {
      const headMessage = 'No available nodes for assignment';
      return this.createDisabledLive(liveInfo, channel, undefined, headMessage, true, cr);
    }

    const args: LiveCreateArgs = {
      liveInfo: req.channelInfo.liveInfo,
      fields: {
        channelId: channel.id,
        isDisabled: false,
        domesticOnly: selectOpts.domesticOnly,
        overseasFirst: selectOpts.overseasFirst,
        liveStreamId: stream.id,
      },
    };
    const live = await this.liveWriter.createByLiveInfo(args);
    const newReq: LiveRegisterRequest = {
      ...req,
      live,
      node,
      criterion: cr,
      logMessage: 'New Live',
    };
    return this.registrar.register(newReq);
  }

  async getLiveStream(req: NewLiveRequest, liveInfo: LiveInfo, channel: ChannelDto): Promise<LiveStreamDto | null> {
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
    if (req.criterionId) {
      const cr = await this.crFinder.findById(req.criterionId);
      if (cr?.enforceCreds) {
        withAuth = true;
      }
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

  private async createDisabledLive(
    liveInfo: LiveInfo,
    channel: ChannelDto,
    existsLive: LiveDto | undefined,
    headMessage: string,
    withNotify: boolean,
    cr: CriterionDto | undefined,
    tx: Tx = db,
  ) {
    if (existsLive) {
      await this.registrar.finishLive({
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
    const newDisabledLive = await this.liveWriter.createByLiveInfo(args, tx);

    const { channelName, viewCnt, liveTitle } = args.liveInfo;
    if (withNotify) {
      const messageFields = `channel=${channelName}, views=${viewCnt}, title=${liveTitle}`;
      this.notifier.notify(`${headMessage}: ${messageFields}`);
    }

    log.info(headMessage, liveAttr(newDisabledLive, { cr }));
    return newDisabledLive.id;
  }
}
