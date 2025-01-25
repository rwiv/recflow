import { Inject, Injectable } from '@nestjs/common';
import { PlatformChecker } from './checker.js';
import { ENV, QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { ChzzkFetcher } from '../platform/chzzk.fetcher.js';
import { Env } from '../common/env.js';
import { TargetedLiveRepository } from '../storage/repositories/targeted-live.repository.js';
import { Allocator } from './allocator.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopFetcher } from '../platform/soop.fetcher.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';

@Injectable()
export class Observer {
  private curInterval: NodeJS.Timeout | undefined;
  private isObserving: boolean = false;
  private readonly checkCycle: number = 5 * 1000;
  private readonly chzzkChacker: PlatformChecker;
  private readonly soopChecker: PlatformChecker;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly targeted: TargetedLiveRepository,
    private readonly allocator: Allocator,
  ) {
    const cFetcher = new ChzzkFetcher(this.env, this.query);
    const cFilter = new ChzzkLiveFilter(cFetcher, this.query);
    this.chzzkChacker = new PlatformChecker(this.query, cFetcher, targeted, allocator, cFilter);

    const sFetcher = new SoopFetcher(this.env, this.query);
    const sFilter = new SoopLiveFilter(cFetcher, this.query);
    this.soopChecker = new PlatformChecker(this.query, sFetcher, targeted, allocator, sFilter);
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
