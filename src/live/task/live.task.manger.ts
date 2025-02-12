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

@Injectable()
export class LivePeriodTaskManager {
  constructor(
    private readonly liveCoordinator: LiveCoordinator,
    private readonly liveRefresher: LiveRefresher,
    private readonly scheduler: TaskScheduler,
  ) {}

  // TODO: update
  getRegisterTaskStatus() {
    const task = this.scheduler.getPeriodTask(liveTaskNameEnum.Values.LIVE_REGISTER + '_' + 'chzzk');
    if (!task) {
      return false;
    }
    return task.getStatus() === 'active';
  }

  initInject() {
    this.insertRegisterTask();

    const cleanupTask = new LiveCleanupTask(this.liveCoordinator);
    this.scheduler.addPeriodTask(cleanupTask, DEFAULT_CLEANUP_CYCLE);

    const refreshTask = new LiveRefreshTask(this.liveRefresher);
    this.scheduler.addPeriodTask(refreshTask, DEFAULT_REFRESH_CYCLE);
  }

  insertRegisterTask(start: boolean = false) {
    const chzzkRegisterTask = new LiveRegisterTask('chzzk', this.liveCoordinator);
    const soopRegisterTask = new LiveRegisterTask('soop', this.liveCoordinator);
    this.scheduler.addPeriodTask(chzzkRegisterTask, DEFAULT_REGISTER_CYCLE);
    this.scheduler.addPeriodTask(soopRegisterTask, DEFAULT_REGISTER_CYCLE);
    if (start) {
      this.scheduler.getPeriodTask(liveTaskNameEnum.Values.LIVE_REGISTER + '_' + 'chzzk')?.start();
      this.scheduler.getPeriodTask(liveTaskNameEnum.Values.LIVE_REGISTER + '_' + 'soop')?.start();
    }
  }

  cancelRegisterTask() {
    this.scheduler.cancelPeriodTask(liveTaskNameEnum.Values.LIVE_REGISTER + '_' + 'chzzk');
    this.scheduler.cancelPeriodTask(liveTaskNameEnum.Values.LIVE_REGISTER + '_' + 'soop');
  }
}
