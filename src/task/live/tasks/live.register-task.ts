import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../../live/registry/live.coordinator.js';
import { PlatformCriterionDto } from '../../../criterion/spec/criterion.dto.schema.js';

export class LiveRegisterTask implements Task {
  public readonly name: string;

  constructor(
    private readonly criterion: PlatformCriterionDto,
    private readonly liveCoordinator: LiveCoordinator,
  ) {
    this.name = `${liveTaskName.LIVE_REGISTER}_${this.criterion.name}`;
  }

  async run(): Promise<void> {
    await this.liveCoordinator.registerQueriedLives(this.criterion);
  }
}
