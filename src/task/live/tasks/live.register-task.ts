import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../../live/registry/live.coordinator.js';
import { CriterionFinder } from '../../../criterion/service/criterion.finder.js';
import { log } from 'jslog';

export class LiveRegisterTask implements Task {
  public readonly name: string;

  constructor(
    private readonly crId: string,
    private readonly crName: string,
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
  ) {
    this.name = `${liveTaskName.LIVE_REGISTER}_${this.crName}`;
  }

  async run(): Promise<void> {
    const cr = await this.crFinder.findById(this.crId);
    if (!cr) {
      log.info(`Criterion not found: crId=${this.crId}`);
      return;
    }
    await this.liveCoordinator.registerQueriedLives(cr);
  }
}
