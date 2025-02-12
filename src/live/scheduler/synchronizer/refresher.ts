import { Synchronizer } from './synchronizer.js';
import { LiveRegistrar } from '../../registry/live.registrar.js';
import { ScheduleErrorHandler } from '../error.handler.js';

export class LiveRefresher extends Synchronizer {
  constructor(
    private readonly liveService: LiveRegistrar,
    eh: ScheduleErrorHandler,
  ) {
    super(eh);
  }

  protected override async check() {
    await this.liveService.refreshAllLives();
  }
}
