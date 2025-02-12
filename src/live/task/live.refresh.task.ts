import { Task } from '../../task/spec/task.interface.js';
import { LiveRefresher } from '../access/live.refresher.js';
import { liveTaskNameEnum } from './live.task.names.js';

export class LiveRefreshTask implements Task {
  constructor(private readonly liveRefresher: LiveRefresher) {}
  getName(): string {
    return liveTaskNameEnum.Values.LIVE_REFRESH;
  }

  async run(): Promise<void> {
    await this.liveRefresher.refreshAllLives();
  }
}
