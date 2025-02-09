import { Synchronizer } from './synchronizer.js';
import { PlatformType } from '../../../platform/platform.types.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { LiveService } from '../../business/live.service.js';
import { ScheduleErrorHandler } from '../error.handler.js';
import { LiveRecord } from '../../business/types.js';

export class LiveCleaner extends Synchronizer {
  constructor(
    private readonly platform: PlatformType,
    private readonly fetcher: PlatformFetcher,
    private readonly liveService: LiveService,
    eh: ScheduleErrorHandler,
  ) {
    super(eh);
  }

  protected override async check() {
    const lives = (await this.liveService.findAll()).filter((info) => info.type === this.platform);
    await Promise.all(lives.map((live) => this.processLive(live)));
  }

  private async processLive(live: LiveRecord) {
    const channel = await this.fetcher.fetchChannel(this.platform, live.channelId, false);
    if (channel?.openLive) return null;
    await this.liveService.delete(live.channelId, { purge: true });
  }
}
