import { Synchronizer } from './synchronizer.js';
import { LiveService } from '../../business/live.service.js';
import { ScheduleErrorHandler } from '../error.handler.js';

export class LiveRefresher extends Synchronizer {
  constructor(
    private readonly liveService: LiveService,
    eh: ScheduleErrorHandler,
  ) {
    super(eh);
  }

  protected override async check() {
    await this.liveService.refreshAllLives();
  }
}
