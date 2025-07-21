import { Injectable } from '@nestjs/common';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { LiveCoordinator } from '../../live/registry/live.coordinator.js';
import { LiveRefresher } from '../../live/data/live.refresher.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { LiveCleaner } from '../../live/registry/live.cleaner.js';
// import { LiveRefreshTask } from './tasks/live.refresh-task.js';
import { LiveRegisterCheckTask } from './tasks/live.register-check.task.js';
// import { LiveRecoveryTask } from './tasks/live-recovery.task.js';
import { LiveRecoveryManager } from '../../live/registry/live.recovery.js';
import {
  DEFAULT_RECOVERY_CYCLE,
  DEFAULT_CLEANUP_CYCLE,
  DEFAULT_REFRESH_CYCLE,
  DEFAULT_REGISTER_CHECK_CYCLE,
  DEFAULT_REGISTER_CYCLE,
  DEFAULT_LIVE_STATE_CLEANUP_CYCLE,
  DEFAULT_LIVE_ALLOCATION_CYCLE,
} from './spec/live.task.contants.js';
// import { LiveFollowedRegisterTask } from './tasks/live.register-followed-task.js';
// import { LiveStateCleanupTask } from './tasks/live-state.cleanup-task.js';
import { LiveStateCleaner } from '../../live/data/live.state.cleaner.js';
// import { LiveAllocationTask } from './tasks/live.allocation-task.js';
import { LiveAllocator } from '../../live/registry/live.allocator.js';
import { Task } from '../spec/task.interface.js';
import { liveTaskName } from './spec/live.task.names.js';

@Injectable()
export class LiveTaskInitializer {
  constructor(
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
    private readonly liveCleaner: LiveCleaner,
    private readonly liveRefresher: LiveRefresher,
    private readonly liveStateCleaner: LiveStateCleaner,
    private readonly liveRecoveryManager: LiveRecoveryManager,
    private readonly liveAllocator: LiveAllocator,
    private readonly scheduler: TaskScheduler,
  ) {}

  init() {
    const registerCheckTask = new LiveRegisterCheckTask(this.crFinder, this.liveCoordinator, this.scheduler);
    this.scheduler.addPeriodTask(registerCheckTask, DEFAULT_REGISTER_CHECK_CYCLE, true);

    const cleanupTask: Task = {
      name: liveTaskName.LIVE_CLEANUP,
      run: () => this.liveCleaner.cleanup(),
    };
    this.scheduler.addPeriodTask(cleanupTask, DEFAULT_CLEANUP_CYCLE, true);

    const refreshTask: Task = {
      name: liveTaskName.LIVE_REFRESH,
      run: () => this.liveRefresher.refreshEarliestOne(),
    };
    // const refreshTask = new LiveRefreshTask(this.liveRefresher);
    this.scheduler.addPeriodTask(refreshTask, DEFAULT_REFRESH_CYCLE, true);

    const recoveryTask: Task = {
      name: liveTaskName.LIVE_RECOVERY,
      run: () => this.liveRecoveryManager.check(),
    };
    // const recoveryTask = new LiveRecoveryTask(this.liveRecoveryManager);
    this.scheduler.addPeriodTask(recoveryTask, DEFAULT_RECOVERY_CYCLE, true);

    const followedRegisterTask: Task = {
      name: liveTaskName.LIVE_REGISTER_FOLLOWED,
      run: () => this.liveCoordinator.registerFollowedLives(),
    };
    // const followedRegisterTask = new LiveFollowedRegisterTask(this.liveCoordinator);
    this.scheduler.addPeriodTask(followedRegisterTask, DEFAULT_REGISTER_CYCLE, true);

    const liveStateCleanupTask: Task = {
      name: liveTaskName.LIVE_STATE_CLEANUP,
      run: () => this.liveStateCleaner.cleanup(),
    };
    // const liveStateCleanupTask = new LiveStateCleanupTask(this.liveStateCleaner);
    this.scheduler.addPeriodTask(liveStateCleanupTask, DEFAULT_LIVE_STATE_CLEANUP_CYCLE, true);

    const liveAllocationTask: Task = {
      name: liveTaskName.LIVE_ALLOCATION,
      run: () => this.liveAllocator.check(),
    };
    // const liveAllocationTask = new LiveAllocationTask(this.liveAllocator);
    this.scheduler.addPeriodTask(liveAllocationTask, DEFAULT_LIVE_ALLOCATION_CYCLE, true);
  }
}
