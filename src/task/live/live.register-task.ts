import { Task } from '../spec/task.interface.js';
import { LiveDetector } from '../../live/detection/live.detector.js';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { LIVE_REGISTER_CRITERION_NAME } from './live.task.contants.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';

export class LiveRegisterTask implements Task {
  public readonly name: string = LIVE_REGISTER_CRITERION_NAME;

  constructor(
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveDetector,
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
    await this.liveCoordinator.checkQueriedLives(cr);
  }
}
