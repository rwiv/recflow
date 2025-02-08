import { Injectable } from '@nestjs/common';
import { TrackedLiveService } from '../business/tracked-live.service.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveCleaner } from './synchronizer/cleaner.js';
import { LiveAppender } from './synchronizer/injector.js';
import { LiveRefresher } from './synchronizer/refresher.js';
import { log } from 'jslog';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { ScheduleErrorHandler } from './error.handler.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import {
  DEFAULT_CLEAN_CYCLE,
  DEFAULT_INJECT_CYCLE,
  DEFAULT_REFRESH_CYCLE,
} from '../../common/data/constants.js';

@Injectable()
export class LiveScheduler {
  isObserving: boolean = false;

  private intervals: NodeJS.Timeout[] = [];

  private readonly chzzkCleaner: LiveCleaner;
  private readonly soopCleaner: LiveCleaner;
  private readonly chzzkAppender: LiveAppender;
  private readonly soopAppender: LiveAppender;
  private readonly refresher: LiveRefresher;

  constructor(
    cf: ChannelFinder,
    ft: PlatformFetcher,
    ls: TrackedLiveService,
    clf: ChzzkLiveFilter,
    slf: SoopLiveFilter,
    eh: ScheduleErrorHandler,
  ) {
    this.chzzkAppender = new LiveAppender('chzzk', ft, ls, cf, clf, eh);
    this.soopAppender = new LiveAppender('soop', ft, ls, cf, slf, eh);
    this.chzzkCleaner = new LiveCleaner('chzzk', ft, ls, eh);
    this.soopCleaner = new LiveCleaner('soop', ft, ls, eh);
    this.refresher = new LiveRefresher(ls, eh);
  }

  run() {
    if (this.isObserving) {
      throw new ConflictError('already observing');
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
    this.chzzkAppender.sync();
    this.soopAppender.sync();
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
