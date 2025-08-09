import { Injectable } from '@nestjs/common';
import { LiveStreamService } from './live-stream.service.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import { LiveStreamDto } from '../spec/live.dto.schema.js';
import { log } from 'jslog';
import { streamAttr } from '../../common/attr/attr.live.js';

export const BATCH_NUM = 10; // TODO: use config
export const RETRY_LIMIT = 5;
export const RETRY_DELAY_MS = 1000;

@Injectable()
export class LiveStreamAuditor {
  constructor(
    private readonly streamService: LiveStreamService,
    private readonly fetcher: PlatformFetcher,
    private readonly stlink: Stlink,
  ) {}

  async check() {
    const promises = [];
    for (const stream of await this.streamService.findEarliestChecked(BATCH_NUM)) {
      promises.push(this.checkOne(stream));
    }
    await Promise.allSettled(promises);
  }

  async checkOne(stream: LiveStreamDto) {
    const platform = stream.channel.platform.name;
    const sourceId = stream.channel.sourceId;
    const info = await this.fetcher.fetchChannelNotNull(platform, sourceId, true);
    if (!info.openLive) {
      log.debug('Delete Closed Live Stream', streamAttr(stream));
      return this.removeIfPassible(stream);
    }
    if (info.liveInfo?.liveUid !== stream.sourceId) {
      log.debug('Delete Restarted Live Stream', streamAttr(stream));
      return this.removeIfPassible(stream);
    }
    const liveCnt = await this.streamService.findLiveCountByStreamId(stream.id);
    if (liveCnt === 0) {
      // If m3u8 is not available (e.g. soop standby mode)
      if (!(await this.stlink.fetchM3u8(stream, { limit: RETRY_LIMIT, delayMs: RETRY_DELAY_MS, backoff: true }))) {
        // If a live is created in a disabled, It cannot detect the situation where the live was set to standby and then reactivated in Soop
        log.warn('M3U8 not available', { ...streamAttr(stream), called_by: 'LiveStreamAuditor.checkOne' });
        await this.streamService.delete(stream.id);
        return;
      }
    }
    await this.streamService.update(stream.id, { checkedAt: new Date() });
  }

  private async removeIfPassible(stream: LiveStreamDto) {
    const liveCnt = await this.streamService.findLiveCountByStreamId(stream.id);
    if (liveCnt === 0) {
      await this.streamService.delete(stream.id);
    } else {
      await this.streamService.update(stream.id, { checkedAt: new Date() });
    }
  }
}
