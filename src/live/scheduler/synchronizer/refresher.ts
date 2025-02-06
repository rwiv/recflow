import { Synchronizer } from './synchronizer.js';
import { TrackedLiveService } from '../../business/tracked-live.service.js';
import { ScheduleErrorHandler } from '../error.handler.js';

export class LiveRefresher extends Synchronizer {
  constructor(
    private readonly liveService: TrackedLiveService,
    eh: ScheduleErrorHandler,
  ) {
    super(eh);
  }

  protected override async check() {
    await this.liveService.refreshAllLives();
  }
}
