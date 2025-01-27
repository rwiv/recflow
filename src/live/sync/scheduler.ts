import { Inject, Injectable } from '@nestjs/common';
import { LiveSynchronizer } from './synchronizer.js';
import { QUERY } from '../../common/config.module.js';
import { QueryConfig } from '../../common/query.js';
import { TrackedLiveService } from '../service/tracked-live.service.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { DEFAULT_CHECK_CYCLE } from './consts.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';

@Injectable()
export class LiveScheduler {
  private curInterval: NodeJS.Timeout | undefined;
  private isObserving: boolean = false;
  private readonly checkCycle: number = DEFAULT_CHECK_CYCLE;
  private readonly chzzkSync: LiveSynchronizer;
  private readonly soopSync: LiveSynchronizer;

  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    fetcher: PlatformFetcher,
    tracked: TrackedLiveService,
    chzzkFilter: ChzzkLiveFilter,
    soopFilter: SoopLiveFilter,
  ) {
    this.chzzkSync = new LiveSynchronizer('chzzk', this.query, fetcher, tracked, chzzkFilter);

    this.soopSync = new LiveSynchronizer('soop', this.query, fetcher, tracked, soopFilter);
  }

  run() {
    if (this.isObserving) {
      throw Error('already observing');
    }

    this.chzzkSync.check();
    this.soopSync.check();
    this.curInterval = setInterval(async () => {
      await this.chzzkSync.check();
      await this.soopSync.check();
    }, this.checkCycle);

    this.isObserving = true;
  }

  stop() {
    clearInterval(this.curInterval);
    this.curInterval = undefined;
    this.isObserving = false;
  }
}
