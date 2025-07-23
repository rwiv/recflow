import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { LiveStreamRepository } from '../storage/live-stream.repository.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import { ChannelInfo } from '../../platform/spec/wapper/channel.js';
import { LiveStreamService } from './live-stream.service.js';

export const QUERY_LIMIT = 10;

@Injectable()
export class LiveStreamDetector {
  constructor(
    private readonly liveStreamRepo: LiveStreamRepository,
    private readonly liveStreamService: LiveStreamService,
    private readonly channelWriter: ChannelWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly stlink: Stlink,
  ) {}

  async check(platform: PlatformName) {
    const channels = await this.liveStreamRepo.findChannelsForCheckStream(platform, QUERY_LIMIT);
    const promises = [];
    for (const channel of channels) {
      promises.push(this.checkOne(platform, channel.id, channel.pid));
    }
    await Promise.allSettled(promises);
  }

  async checkOne(platform: PlatformName, channelId: string, pid: string) {
    let info = await this.fetcher.fetchChannelNotNull(platform, pid, false);
    if (!info.openLive) {
      return this.updateChannel(channelId, info);
    }
    info = await this.fetcher.fetchChannelNotNull(platform, pid, true);
    if (!info.liveInfo) {
      return this.updateChannel(channelId, info);
    }

    const stRes = await this.stlink.fetchStreamInfo(platform, pid, info.liveInfo.isAdult);
    const streamInfo = this.stlink.toStreamInfo(stRes, info.liveInfo);
    if (!streamInfo) {
      return this.updateChannel(channelId, info);
    }

    await this.liveStreamService.createBy({ sourceId: info.liveInfo.liveId, channelId, streamInfo });
    await this.updateChannel(channelId, info);

    const attr = {
      channel_uid: info.pid,
      channel_name: info.username,
      stream_url: streamInfo.url,
    };
    log.debug('Live Stream Detected', attr);
  }

  private updateChannel(channelId: string, info: ChannelInfo) {
    return this.channelWriter.refreshOne(channelId, info, { streamCheck: true });
  }
}
