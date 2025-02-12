import { Task } from '../../../task/spec/task.interface.js';
import { liveTaskNameEnum } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../registry/live.coordinator.js';
import { PlatformCriterionDto } from '../../../criterion/spec/criterion.dto.schema.js';

export class LiveRegisterTask implements Task {
  constructor(
    private readonly criterion: PlatformCriterionDto,
    private readonly liveCoordinator: LiveCoordinator,
  ) {}

  getName(): string {
    return `${liveTaskNameEnum.Values.LIVE_REGISTER}_${this.criterion.name}`;
  }

  async run(): Promise<void> {
    await this.liveCoordinator.registerQueriedLives(this.criterion);
  }
}
