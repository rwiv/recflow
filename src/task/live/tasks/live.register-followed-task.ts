import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../../live/registry/live.coordinator.js';

export class LiveFollowedRegisterTask implements Task {
  public readonly name: string;

  constructor(private readonly liveCoordinator: LiveCoordinator) {
    this.name = liveTaskName.LIVE_REGISTER_FOLLOWED;
  }

  async run(): Promise<void> {
    await this.liveCoordinator.registerFollowedLives();
  }
}
