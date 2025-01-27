import { Inject, Injectable } from '@nestjs/common';
import { TrackedChecker } from './tracked.checker.js';
import { QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { TrackedLiveRepository } from '../storage/repositories/tracked-live-repository.service.js';
import { LiveAllocator } from './allocator.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { DEFAULT_CHECK_CYCLE } from './consts.js';
import { PlatformFetcher } from '../platform/fetcher.js';

@Injectable()
export class TrackedObserver {
  private curInterval: NodeJS.Timeout | undefined;
  private isObserving: boolean = false;
  private readonly checkCycle: number = DEFAULT_CHECK_CYCLE;
  private readonly chzzkChacker: TrackedChecker;
  private readonly soopChecker: TrackedChecker;

  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    fetcher: PlatformFetcher,
    tracked: TrackedLiveRepository,
    allocator: LiveAllocator,
    chzzkFilter: ChzzkLiveFilter,
    soopFilter: SoopLiveFilter,
  ) {
    this.chzzkChacker = new TrackedChecker(
      'chzzk',
      this.query,
      fetcher,
      tracked,
      allocator,
      chzzkFilter,
    );

    this.soopChecker = new TrackedChecker(
      'soop',
      this.query,
      fetcher,
      tracked,
      allocator,
      soopFilter,
    );
  }

  observe() {
    if (this.isObserving) {
      throw Error('already observing');
    }

    this.chzzkChacker.check();
    this.soopChecker.check();
    this.curInterval = setInterval(async () => {
      await this.chzzkChacker.check();
      await this.soopChecker.check();
    }, this.checkCycle);

    this.isObserving = true;
  }

  stop() {
    clearInterval(this.curInterval);
    this.curInterval = undefined;
    this.isObserving = false;
  }
}
