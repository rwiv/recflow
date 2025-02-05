import { Synchronizer } from './synchronizer.js';
import { PlatformType } from '../../../platform/types.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { TrackedLiveService } from '../../business/tracked-live.service.js';
import { LiveInfo } from '../../../platform/wapper/live.js';

export class LiveCleaner extends Synchronizer {
  constructor(
    private readonly platform: PlatformType,
    private readonly fetcher: PlatformFetcher,
    private readonly liveService: TrackedLiveService,
  ) {
    super();
  }

  protected async check() {
    const lives = (await this.liveService.findAll()).filter((info) => info.type === this.platform);
    const toBeDeletedLives = (
      await Promise.all(lives.map(async (live) => this.isToBeDeleted(live)))
    ).filter((live) => live !== null);

    for (const live of toBeDeletedLives) {
      await this.liveService.delete(live.channelId, { isPurge: true });
    }
  }

  private async isToBeDeleted(existingInfo: LiveInfo) {
    const channel = await this.fetcher.fetchChannel(this.platform, existingInfo.channelId, false);
    if (channel?.openLive) return null;
    return existingInfo;
  }
}
