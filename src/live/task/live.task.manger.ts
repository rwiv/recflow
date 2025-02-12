import { Injectable } from '@nestjs/common';
import { LiveCoordinator } from '../registry/live.coordinator.js';
import { LiveRefresher } from '../access/live.refresher.js';
import { TaskScheduler } from '../../task/schedule/task.scheduler.js';
import { LiveRefreshTask } from './tasks/live.refresh-task.js';
import {
  DEFAULT_CLEANUP_CYCLE,
  DEFAULT_REGISTER_CYCLE,
  DEFAULT_REFRESH_CYCLE,
} from './spec/live.task.contants.js';
import { LiveCleanupTask } from './tasks/live.cleanup-task.js';
import { LiveRegisterTask } from './tasks/live.register-task.js';
import { liveTaskNameEnum } from './spec/live.task.names.js';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { CriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { PeriodTask } from '../../task/schedule/period-task.js';

@Injectable()
export class LivePeriodTaskManager {
  constructor(
    private readonly criterionFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
    private readonly liveRefresher: LiveRefresher,
    private readonly scheduler: TaskScheduler,
  ) {}

  async getRegisterTaskStatus() {
    const criteria = await this.criterionFinder.findAll();
    let isActive = true;
    const tasks: PeriodTask[] = [];
    for (const cr of criteria) {
      const task = this.scheduler.getPeriodTask(this.getTaskName(cr));
      if (!task) {
        isActive = false;
        break;
      }
      tasks.push(task);
    }
    if (!isActive) return;
    for (const task of tasks) {
      if (task.getStatus() !== 'active') {
        isActive = false;
        break;
      }
    }
    return isActive;
  }

  getTaskName(cr: CriterionDto) {
    return `${liveTaskNameEnum.Values.LIVE_REGISTER}_${cr.name}`;
  }

  async initInject() {
    await this.insertRegisterTask();

    const cleanupTask = new LiveCleanupTask(this.liveCoordinator);
    this.scheduler.addPeriodTask(cleanupTask, DEFAULT_CLEANUP_CYCLE);

    const refreshTask = new LiveRefreshTask(this.liveRefresher);
    this.scheduler.addPeriodTask(refreshTask, DEFAULT_REFRESH_CYCLE);
  }

  async insertRegisterTask(start: boolean = false) {
    const taskNames: string[] = [];
    for (const cr of await this.criterionFinder.findAll()) {
      const registerTask = new LiveRegisterTask(cr, this.liveCoordinator);
      taskNames.push(registerTask.getName());
      this.scheduler.addPeriodTask(registerTask, DEFAULT_REGISTER_CYCLE);
    }
    if (start) {
      for (const name of taskNames) {
        this.scheduler.getPeriodTask(name)?.start();
      }
    }
  }

  async cancelRegisterTask() {
    for (const cr of await this.criterionFinder.findAll()) {
      this.scheduler.cancelPeriodTask(this.getTaskName(cr));
    }
  }
}
