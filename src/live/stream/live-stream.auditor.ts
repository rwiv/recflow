import { Injectable } from '@nestjs/common';
import { LiveStreamService } from './live-stream.service.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import { LiveStreamDto } from '../spec/live.dto.schema.js';
import { log } from 'jslog';
import { streamAttr } from '../../common/attr/attr.live.js';

export const BATCH_NUM = 10; // TODO: use config

@Injectable()
export class LiveStreamAuditor {
  constructor(
    private readonly liveStreamService: LiveStreamService,
    private readonly fetcher: PlatformFetcher,
    private readonly stlink: Stlink,
  ) {}

  async check() {
    const promises = [];
    for (const stream of await this.liveStreamService.findEarliestChecked(BATCH_NUM)) {
      promises.push(this.checkOne(stream));
    }
    await Promise.allSettled(promises);
  }

  async checkOne(stream: LiveStreamDto) {
    const platform = stream.channel.platform.name;
    const pid = stream.channel.pid;
    const info = await this.fetcher.fetchChannelNotNull(platform, pid, true);
    if (!info.openLive) {
      log.debug('Delete Closed Live Stream', streamAttr(stream));
      return this.remove(stream);
    }
    if (info.liveInfo?.liveId !== stream.sourceId) {
      log.debug('Delete Restarted Live Stream', streamAttr(stream));
      return this.remove(stream);
    }
    const liveCnt = await this.liveStreamService.findLiveCountByStreamId(stream.id);
    if (liveCnt === 0) {
      // If m3u8 is not available (e.g. soop standby mode)
      const m3u8 = await this.stlink.fetchM3u8(stream);
      if (!m3u8) {
        // If a live is created in a disabled, It cannot detect the situation where the live was set to standby and then reactivated in Soop
        log.warn('M3U8 not available', streamAttr(stream));
        await this.liveStreamService.delete(stream.id);
        return;
      }
    }
    await this.liveStreamService.update(stream.id, { checkedAt: new Date() });
  }

  private async remove(stream: LiveStreamDto) {
    const liveCnt = await this.liveStreamService.findLiveCountByStreamId(stream.id);
    if (liveCnt === 0) {
      await this.liveStreamService.delete(stream.id);
    } else {
      await this.liveStreamService.update(stream.id, { checkedAt: new Date() });
    }
  }
}
