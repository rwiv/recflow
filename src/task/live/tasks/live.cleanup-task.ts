import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveCleaner } from '../../../live/registry/live.cleaner.js';

export class LiveCleanupTask implements Task {
  public readonly name = liveTaskName.LIVE_CLEANUP;

  constructor(private readonly liveCleaner: LiveCleaner) {}

  async run(): Promise<void> {
    await this.liveCleaner.cleanup();
  }
}
