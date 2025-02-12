import { Task } from '../../../task/spec/task.interface.js';
import { liveTaskNameEnum } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../registry/live.coordinator.js';
import { PlatformName } from '../../../platform/spec/storage/platform.enum.schema.js';

export class LiveRegisterTask implements Task {
  constructor(
    private readonly platformName: PlatformName,
    private readonly liveCoordinator: LiveCoordinator,
  ) {}

  getName(): string {
    return liveTaskNameEnum.Values.LIVE_REGISTER + '_' + this.platformName;
  }

  async run(): Promise<void> {
    await this.liveCoordinator.registerQueriedLives(this.platformName);
  }
}
