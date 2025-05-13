import { Injectable } from '@nestjs/common';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { LiveCoordinator } from '../../live/registry/live.coordinator.js';
import { LiveRefresher } from '../../live/data/live.refresher.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { LiveCleaner } from '../../live/registry/live.cleaner.js';
import { LiveRefreshTask } from './tasks/live.refresh-task.js';
import { LiveRegisterCheckTask } from './tasks/live.register-check.task.js';
import { LiveRecoveryTask } from './tasks/live-recovery.task.js';
import { LiveRecoveryManager } from '../../live/registry/live.recovery.js';
import { LiveCleanupTask } from './tasks/live.cleanup-task.js';
import {
  DEFAULT_RECOVERY_CYCLE,
  DEFAULT_CLEANUP_CYCLE,
  DEFAULT_REFRESH_CYCLE,
  DEFAULT_REGISTER_CHECK_CYCLE,
  DEFAULT_REGISTER_CYCLE,
  DEFAULT_LIVE_STATE_CLEANUP_CYCLE,
} from './spec/live.task.contants.js';
import { LiveFollowedRegisterTask } from './tasks/live.register-followed-task.js';
import { LiveStateCleanupTask } from './tasks/live-state.cleanup-task.js';
import { LiveStateCleaner } from '../../live/data/live.state.cleaner.js';

@Injectable()
export class LiveTaskInitializer {
  constructor(
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
    private readonly liveCleaner: LiveCleaner,
    private readonly liveRefresher: LiveRefresher,
    private readonly liveStateCleaner: LiveStateCleaner,
    private readonly liveRecoveryManager: LiveRecoveryManager,
    private readonly scheduler: TaskScheduler,
  ) {}

  init() {
    const registerCheckTask = new LiveRegisterCheckTask(this.crFinder, this.liveCoordinator, this.scheduler);
    this.scheduler.addPeriodTask(registerCheckTask, DEFAULT_REGISTER_CHECK_CYCLE, true);

    const cleanupTask = new LiveCleanupTask(this.liveCleaner);
    this.scheduler.addPeriodTask(cleanupTask, DEFAULT_CLEANUP_CYCLE, true);

    const refreshTask = new LiveRefreshTask(this.liveRefresher);
    this.scheduler.addPeriodTask(refreshTask, DEFAULT_REFRESH_CYCLE, true);

    const recoveryTask = new LiveRecoveryTask(this.liveRecoveryManager);
    this.scheduler.addPeriodTask(recoveryTask, DEFAULT_RECOVERY_CYCLE, true);

    const followedRegisterTask = new LiveFollowedRegisterTask(this.liveCoordinator);
    this.scheduler.addPeriodTask(followedRegisterTask, DEFAULT_REGISTER_CYCLE, true);

    const liveStateCleanupTask = new LiveStateCleanupTask(this.liveStateCleaner);
    this.scheduler.addPeriodTask(liveStateCleanupTask, DEFAULT_LIVE_STATE_CLEANUP_CYCLE, true);
  }
}
