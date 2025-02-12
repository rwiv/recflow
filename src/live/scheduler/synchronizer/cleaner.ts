import { Synchronizer } from './synchronizer.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { LiveService } from '../../access/live.service.js';
import { ScheduleErrorHandler } from '../error.handler.js';
import { LiveDto } from '../../spec/live.dto.schema.js';
import { LiveFinder } from '../../access/live.finder.js';
import { PlatformType } from '../../../platform/storage/platform.business.schema.js';

export class LiveCleaner extends Synchronizer {
  constructor(
    private readonly platform: PlatformType,
    private readonly fetcher: PlatformFetcher,
    private readonly liveService: LiveService,
    private readonly liveFinder: LiveFinder,
    eh: ScheduleErrorHandler,
  ) {
    super(eh);
  }

  protected override async check() {
    const all = await this.liveFinder.findAll();
    const lives = all.filter((live) => live.platform.name === this.platform);
    await Promise.all(lives.map((live) => this.processLive(live)));
  }

  private async processLive(liveRec: LiveDto) {
    const pid = liveRec.channel.pid;
    const channel = await this.fetcher.fetchChannel(this.platform, pid, false);
    if (channel?.openLive) return null;
    await this.liveService.delete(liveRec.id, { purge: true });
  }
}
