import { Inject, Injectable } from '@nestjs/common';
import { PlatformChecker } from './checker.js';
import { ENV, QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { ChzzkFetcher } from '../platform/chzzk.fetcher.js';
import { Env } from '../common/env.js';
import { TrackedLiveRepository } from '../storage/repositories/tracked-live-repository.service.js';
import { Allocator } from './allocator.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopFetcher } from '../platform/soop.fetcher.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { DEFAULT_CHECK_CYCLE } from './consts.js';

@Injectable()
export class Observer {
  private curInterval: NodeJS.Timeout | undefined;
  private isObserving: boolean = false;
  private readonly checkCycle: number = DEFAULT_CHECK_CYCLE;
  private readonly chzzkChacker: PlatformChecker;
  private readonly soopChecker: PlatformChecker;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
    tracked: TrackedLiveRepository,
    allocator: Allocator,
  ) {
    const chzzkFetcher = new ChzzkFetcher(this.env, this.query);
    const chzzkFilter = new ChzzkLiveFilter(chzzkFetcher, this.query);
    this.chzzkChacker = new PlatformChecker(
      'chzzk',
      this.query,
      chzzkFetcher,
      tracked,
      allocator,
      chzzkFilter,
    );

    const soopFetcher = new SoopFetcher(this.env, this.query);
    const soopFilter = new SoopLiveFilter(chzzkFetcher, this.query);
    this.soopChecker = new PlatformChecker(
      'soop',
      this.query,
      soopFetcher,
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
