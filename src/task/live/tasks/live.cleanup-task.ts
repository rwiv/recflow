import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../../live/registry/live.coordinator.js';

export class LiveCleanupTask implements Task {
  public readonly name = liveTaskName.LIVE_CLEANUP;

  constructor(private readonly liveCoordinator: LiveCoordinator) {}

  async run(): Promise<void> {
    await this.liveCoordinator.cleanup();
  }
}
