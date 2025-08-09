import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { LiveStreamRepository } from '../storage/live-stream.repository.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import { ChannelInfo } from '../../platform/spec/wapper/channel.js';
import { LiveStreamService } from './live-stream.service.js';
import { liveInfoAttr } from '../../common/attr/attr.live.js';

export const QUERY_LIMIT = 10; // TODO: use config

@Injectable()
export class LiveStreamDetector {
  constructor(
    private readonly streamRepo: LiveStreamRepository,
    private readonly lsService: LiveStreamService,
    private readonly channelWriter: ChannelWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly stlink: Stlink,
  ) {}

  async check(platform: PlatformName) {
    const channels = await this.streamRepo.findChannelsForCheckStream(platform, QUERY_LIMIT);
    const promises = [];
    for (const channel of channels) {
      promises.push(this.checkOne(platform, channel.id, channel.sourceId));
    }
    await Promise.allSettled(promises);
  }

  async checkOne(platform: PlatformName, channelId: string, sourceId: string) {
    let info = await this.fetcher.fetchChannelNotNull(platform, sourceId, false);
    if (!info.openLive) {
      return this.updateChannel(channelId, info);
    }
    info = await this.fetcher.fetchChannelNotNull(platform, sourceId, true);
    if (!info.liveInfo) {
      return this.updateChannel(channelId, info);
    }

    const stRes = await this.stlink.fetchStreamInfo(platform, sourceId, info.liveInfo.isAdult);
    const streamInfo = this.stlink.toStreamInfo(stRes, info.liveInfo);
    if (!streamInfo) {
      return this.updateChannel(channelId, info);
    }
    const attr = { ...liveInfoAttr(info.liveInfo), stream_url: streamInfo.url };

    if (!(await this.stlink.fetchM3u8(streamInfo))) {
      log.error('M3U8 not available', { ...attr, called_by: 'LiveStreamDetector.checkOne' });
      return this.updateChannel(channelId, info);
    }

    await this.lsService.create({ sourceId: info.liveInfo.liveUid, channelId, streamInfo });
    await this.updateChannel(channelId, info);

    log.debug('Live Stream Detected', attr);
  }

  private updateChannel(channelId: string, info: ChannelInfo) {
    return this.channelWriter.refreshOne(channelId, info, { streamCheck: true });
  }
}
