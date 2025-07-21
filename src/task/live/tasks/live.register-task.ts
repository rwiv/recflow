import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveCoordinator } from '../../../live/registry/live.coordinator.js';
import { CriterionFinder } from '../../../criterion/service/criterion.finder.js';
import { DEFAULT_REGISTER_CYCLE } from '../spec/live.task.contants.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { MissingValueError } from '../../../utils/errors/errors/MissingValueError.js';

export class LiveRegisterTask implements Task {
  public readonly name: string = liveTaskName.LIVE_REGISTER;
  public readonly delay: number = DEFAULT_REGISTER_CYCLE;

  constructor(
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
  ) {}

  async run(args: any): Promise<void> {
    const crId = args?.crId;
    if (!crId) {
      throw new MissingValueError('Missing criterion id');
    }
    const cr = await this.crFinder.findById(crId);
    if (!cr) {
      throw NotFoundError.from('Criterion', 'id', crId);
    }
    await this.liveCoordinator.registerQueriedLives(cr);
  }
}
