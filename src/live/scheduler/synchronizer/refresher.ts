import { Synchronizer } from './synchronizer.js';
import { TrackedLiveService } from '../../business/tracked-live.service.js';

export class LiveRefresher extends Synchronizer {
  constructor(private readonly liveService: TrackedLiveService) {
    super();
  }

  protected async check() {
    await this.liveService.refreshAllLives();
  }
}
