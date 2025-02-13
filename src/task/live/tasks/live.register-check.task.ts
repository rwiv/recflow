import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { TaskScheduler } from '../../schedule/task.scheduler.js';
import { DEFAULT_REGISTER_CYCLE } from '../spec/live.task.contants.js';
import { LiveRegisterTask } from './live.register-task.js';
import { LiveCoordinator } from '../../../live/registry/live.coordinator.js';
import { CriterionFinder } from '../../../criterion/service/criterion.finder.js';

export class LiveRegisterCheckTask implements Task {
  public name: string = liveTaskName.LIVE_CHECK_REGISTER;

  constructor(
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
    private readonly scheduler: TaskScheduler,
  ) {}

  async run(): Promise<void> {
    const criteria = await this.crFinder.findAll();
    for (const cr of criteria) {
      const taskName = `${liveTaskName.LIVE_REGISTER}_${cr.name}`;
      const existing = this.scheduler.getPeriodTask(taskName);
      if (!existing) {
        const newTask = new LiveRegisterTask(cr, this.liveCoordinator);
        this.scheduler.addPeriodTask(newTask, DEFAULT_REGISTER_CYCLE, true);
      }
    }

    const existingRegisterPeriodTasks = this.scheduler.allPeriodTasks().filter((t) => {
      return t.taskName.startsWith(liveTaskName.LIVE_REGISTER);
    });
    for (const existing of existingRegisterPeriodTasks) {
      const crName = existing.taskName.replace(`${liveTaskName.LIVE_REGISTER}_`, '');
      if (!criteria.find((c) => c.name === crName)) {
        this.scheduler.cancelPeriodTask(existing.taskName);
      }
    }
  }
}
