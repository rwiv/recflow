import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { CheckedError } from '@/utils/errors/errors/CheckedError.js';
import { MissingValueError } from '@/utils/errors/errors/MissingValueError.js';
import { LogLevel } from '@/utils/log.js';

import { channelAttr, liveAttr, liveInfoAttr } from '@/common/attr/attr.live.js';
import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { Notifier } from '@/external/notify/notifier.js';

import { ChannelLiveInfo } from '@/platform/spec/wapper/channel.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';
import { Stlink } from '@/platform/stlink/stlink.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';
import { ChannelWriter } from '@/channel/service/channel.writer.js';
import { GradeService } from '@/channel/service/grade.service.js';
import { ChannelAppendWithInfo, ChannelDto } from '@/channel/spec/channel.dto.schema.js';
import { DEFAULT_PRIORITY_NAME } from '@/channel/spec/grade.constants.js';

import { CriterionFinder } from '@/criterion/service/criterion.finder.js';
import { CriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

import { NodeSelector } from '@/node/service/node.selector.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveCreateArgs, LiveWriter } from '@/live/data/live.writer.js';
import { LiveInitializer } from '@/live/register/live.initializer.js';
import { LiveRegisterHelper } from '@/live/register/live.register-helper.js';
import { LiveRegistrar } from '@/live/register/live.registrar.js';
import { LiveDto, LiveStreamDto, StreamInfo } from '@/live/spec/live.dto.schema.js';
import { LiveStreamQuery } from '@/live/storage/live-stream.repository.js';
import { LiveStreamService } from '@/live/stream/live-stream.service.js';

const NEW_LIVE_INIT_WAIT_MS = 10_000;

export interface NewLiveRequest {
  channelInfo: ChannelLiveInfo;

  isFollowed?: boolean;
  criterion?: CriterionDto;

  logMessage?: string;
  logLevel?: LogLevel;

  stream?: StreamInfo;
}

@Injectable()
export class LiveInitializerImpl extends LiveInitializer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly nodeSelector: NodeSelector,
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly grService: GradeService,
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
    private readonly streamService: LiveStreamService,
    private readonly registrar: LiveRegistrar,
    private readonly crFinder: CriterionFinder,
    private readonly helper: LiveRegisterHelper,
    private readonly notifier: Notifier,
    private readonly stlink: Stlink,
  ) {
    super();
  }

  async createNewLiveByLive(base: LiveDto, opts: { checkM3u8: boolean }): Promise<string | null> {
    // Validate m3u8
    const stream = base.stream;
    if (!stream) {
      throw new MissingValueError('LiveStream is not set', { attr: liveAttr(base) });
    }
    if (opts.checkM3u8 && !(await this.stlink.fetchM3u8(stream))) {
      const called_by = 'LiveInitializer.createNewLiveByLive';
      log.warn('M3U8 not available', { ...liveAttr(base, { st: true }), called_by });
      return null;
    }

    // Create new live record
    const live = await this.liveWriter.createByLive(base.id);
    return this.registrar.register({ live, logMessage: 'New Same Live' });
  }

  async createNewLive(req: NewLiveRequest): Promise<string | null> {
    const liveInfo = req.channelInfo.liveInfo;
    const cr = req.criterion;

    let channel = await this.chFinder.findByPlatformAndSourceId(liveInfo.type, liveInfo.channelUid);
    if (!channel) {
      const none = await this.grService.findByNameNotNull(DEFAULT_PRIORITY_NAME);
      const append: ChannelAppendWithInfo = { gradeId: none.id, isFollowed: false };
      channel = await this.chWriter.createWithInfo(append, req.channelInfo);
    }

    if (cr?.loggingOnly) {
      const headMessage = 'New Logging Only Live';
      return this.createDisabledLive(liveInfo, channel, undefined, headMessage, false, cr);
    }

    const stream = await this.getLiveStream(req, liveInfo, channel);
    if (!stream) {
      return null;
    }

    const selectArgs = this.helper.getNodeSelectArgs({}, channel, undefined, cr);
    let node = await this.nodeSelector.match(selectArgs);
    if (!channel.grade.shouldSave) {
      node = null;
    }
    // If there is no available node
    if (!node) {
      const headMessage = 'No available nodes for assignment';
      return this.createDisabledLive(liveInfo, channel, undefined, headMessage, true, cr);
    }

    const exists = await this.liveFinder.findByChannelSourceId(channel.sourceId);
    if (exists.length > 0 && exists[0].createdAt >= new Date(Date.now() - NEW_LIVE_INIT_WAIT_MS)) {
      log.warn('Already exists live', liveInfoAttr(liveInfo, { cr }));
      return null;
    }
    const live = await this.liveWriter.createByLiveInfo({
      liveInfo: req.channelInfo.liveInfo,
      fields: {
        channelId: channel.id,
        isDisabled: false,
        domesticOnly: selectArgs.domesticOnly,
        overseasFirst: selectArgs.overseasFirst,
        liveStreamId: stream.id,
      },
    });
    return this.registrar.register({ ...req, live, node, criterion: cr, logMessage: 'New Live' });
  }

  private async getLiveStream(
    req: NewLiveRequest,
    liveInfo: LiveInfo,
    channel: ChannelDto,
  ): Promise<LiveStreamDto | null> {
    const query: LiveStreamQuery = { sourceId: liveInfo.liveUid, channelId: channel.id };
    const exists = await this.streamService.findByQueryLatestOne(query);
    // TODO: fix this (await this.stlink.fetchM3u8(exists))
    if (exists && (await this.stlink.fetchM3u8(exists))) {
      const attr = { ...channelAttr(channel), source_id: exists.sourceId, stream_url: exists.url };
      log.debug('Use existing stream record', attr);
      return exists;
    }

    if (req.stream) {
      return await this.streamService.create({
        sourceId: liveInfo.liveUid,
        channelId: channel.id,
        streamInfo: req.stream,
      });
    }

    // Check if the live is accessible
    let withAuth = liveInfo.isAdult;
    if (req.isFollowed && this.env.stlink.enforceAuthForFollowed) {
      withAuth = true;
    }
    if (req.criterion) {
      if (req.criterion?.enforceCreds) {
        withAuth = true;
      }
    }
    const { platform, sourceId } = req.channelInfo;
    const stRes = await this.stlink.fetchStreamInfo(platform, sourceId, withAuth);
    const streamInfo = this.stlink.toStreamInfo(stRes, liveInfo);
    if (!streamInfo || streamInfo instanceof CheckedError) {
      return null;
    }

    // If m3u8 is not available (e.g. soop standby mode)
    if (!(await this.stlink.fetchM3u8(streamInfo))) {
      // If a live is created in a disabled, It cannot detect the situation where the live was set to standby and then reactivated in Soop
      log.warn('M3U8 not available', { ...channelAttr(channel), called_by: 'LiveInitializer.getLiveStream' });
      return null;
    }

    return await this.streamService.create({ sourceId: liveInfo.liveUid, channelId: channel.id, streamInfo });
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
        logMsg: 'Live already exists, but will be disabled',
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
