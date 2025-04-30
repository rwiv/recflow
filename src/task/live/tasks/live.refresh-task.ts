import { Task } from '../../spec/task.interface.js';
import { LiveRefresher } from '../../../live/data/live.refresher.js';
import { liveTaskName } from '../spec/live.task.names.js';

export class LiveRefreshTask implements Task {
  public readonly name = liveTaskName.LIVE_REFRESH;

  constructor(private readonly liveRefresher: LiveRefresher) {}

  async run(): Promise<void> {
    await this.liveRefresher.refreshEarliestOne();
  }
}
