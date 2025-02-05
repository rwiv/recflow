import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../../common/config.module.js';
import { QueryConfig } from '../../common/query.js';
import { TrackedLiveService } from '../business/tracked-live.service.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { DEFAULT_INJECT_CYCLE, DEFAULT_CLEAN_CYCLE, DEFAULT_REFRESH_CYCLE } from './consts.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveCleaner } from './synchronizer/cleaner.js';
import { LiveInjector } from './synchronizer/injector.js';
import { LiveRefresher } from './synchronizer/refresher.js';
import { log } from 'jslog';

@Injectable()
export class LiveScheduler {
  isObserving: boolean = false;

  private intervals: NodeJS.Timeout[] = [];

  private readonly chzzkCleaner: LiveCleaner;
  private readonly soopCleaner: LiveCleaner;
  private readonly chzzkInjector: LiveInjector;
  private readonly soopInjector: LiveInjector;
  private readonly refresher: LiveRefresher;

  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    ft: PlatformFetcher,
    ls: TrackedLiveService,
    cf: ChzzkLiveFilter,
    sf: SoopLiveFilter,
  ) {
    this.chzzkInjector = new LiveInjector('chzzk', this.query, ft, ls, cf);
    this.soopInjector = new LiveInjector('soop', this.query, ft, ls, sf);
    this.chzzkCleaner = new LiveCleaner('chzzk', ft, ls);
    this.soopCleaner = new LiveCleaner('soop', ft, ls);
    this.refresher = new LiveRefresher(ls);
  }

  run() {
    if (this.isObserving) {
      throw Error('already observing');
    }
    log.info('LiveScheduler is running');

    this.inject();
    this.clean();
    this.refresh();

    this.intervals.push(setInterval(() => this.inject(), DEFAULT_INJECT_CYCLE));
    this.intervals.push(setInterval(() => this.clean(), DEFAULT_CLEAN_CYCLE));
    this.intervals.push(setInterval(() => this.refresh(), DEFAULT_REFRESH_CYCLE));

    this.isObserving = true;
  }

  private inject() {
    this.chzzkInjector.sync();
    this.soopInjector.sync();
  }

  private clean() {
    this.chzzkCleaner.sync();
    this.soopCleaner.sync();
  }

  private refresh() {
    this.refresher.sync();
  }

  stop() {
    log.info('LiveScheduler is stopping');
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals = [];
    this.isObserving = false;
  }
}
