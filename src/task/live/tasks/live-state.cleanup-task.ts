import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveStateCleaner } from '../../../live/data/live.state.cleaner.js';

export class LiveStateCleanupTask implements Task {
  public readonly name = liveTaskName.LIVE_STATE_CLEANUP;

  constructor(private readonly liveStateCleaner: LiveStateCleaner) {}

  async run(): Promise<void> {
    await this.liveStateCleaner.cleanup();
  }
}
