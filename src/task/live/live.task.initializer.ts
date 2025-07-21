import { Inject, Injectable } from '@nestjs/common';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { LiveCoordinator } from '../../live/registry/live.coordinator.js';
import { LiveRefresher } from '../../live/data/live.refresher.js';
import { LiveCleaner } from '../../live/registry/live.cleaner.js';
import { LiveRecoveryManager } from '../../live/registry/live.recovery.js';
import {
  DEFAULT_RECOVERY_CYCLE,
  DEFAULT_CLEANUP_CYCLE,
  DEFAULT_REFRESH_CYCLE,
  DEFAULT_REGISTER_CYCLE,
  DEFAULT_LIVE_STATE_CLEANUP_CYCLE,
  DEFAULT_LIVE_ALLOCATION_CYCLE,
} from './spec/live.task.contants.js';
import { LiveStateCleaner } from '../../live/data/live.state.cleaner.js';
import { LiveAllocator } from '../../live/registry/live.allocator.js';
import { Task } from '../spec/task.interface.js';
import { liveTaskName } from './spec/live.task.names.js';
import { createWorker } from '../schedule/task.utils.js';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { TaskRunner } from '../schedule/task.runner.js';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { LiveRegisterTask } from './tasks/live.register-task.js';

@Injectable()
export class LiveTaskInitializer {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly crFinder: CriterionFinder,
    private readonly liveCoordinator: LiveCoordinator,
    private readonly liveCleaner: LiveCleaner,
    private readonly liveRefresher: LiveRefresher,
    private readonly liveStateCleaner: LiveStateCleaner,
    private readonly liveRecoveryManager: LiveRecoveryManager,
    private readonly liveAllocator: LiveAllocator,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };

    const registerTask = new LiveRegisterTask(this.crFinder, this.liveCoordinator);
    createWorker(registerTask, { connection: this.redis, concurrency: 100 }, this.runner);
    // this.scheduler.addPeriodTask(registerTask, DEFAULT_REGISTER_CYCLE, true);

    const cleanupTask: Task = {
      name: liveTaskName.LIVE_CLEANUP,
      delay: DEFAULT_CLEANUP_CYCLE,
      run: () => this.liveCleaner.cleanup(),
    };
    createWorker(cleanupTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(cleanupTask, DEFAULT_CLEANUP_CYCLE, true);

    const refreshTask: Task = {
      name: liveTaskName.LIVE_REFRESH,
      delay: DEFAULT_REFRESH_CYCLE,
      run: () => this.liveRefresher.refreshEarliestOne(),
    };
    createWorker(refreshTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(refreshTask, DEFAULT_REFRESH_CYCLE, true);

    const recoveryTask: Task = {
      name: liveTaskName.LIVE_RECOVERY,
      delay: DEFAULT_RECOVERY_CYCLE,
      run: () => this.liveRecoveryManager.check(),
    };
    createWorker(recoveryTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(recoveryTask, DEFAULT_RECOVERY_CYCLE, true);

    const followedRegisterTask: Task = {
      name: liveTaskName.LIVE_REGISTER_FOLLOWED,
      delay: DEFAULT_REGISTER_CYCLE,
      run: () => this.liveCoordinator.registerFollowedLives(),
    };
    createWorker(followedRegisterTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(followedRegisterTask, DEFAULT_REGISTER_CYCLE, true);

    const liveStateCleanupTask: Task = {
      name: liveTaskName.LIVE_STATE_CLEANUP,
      delay: DEFAULT_LIVE_STATE_CLEANUP_CYCLE,
      run: () => this.liveStateCleaner.cleanup(),
    };
    createWorker(liveStateCleanupTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(liveStateCleanupTask, DEFAULT_LIVE_STATE_CLEANUP_CYCLE, true);

    const liveAllocationTask: Task = {
      name: liveTaskName.LIVE_ALLOCATION,
      delay: DEFAULT_LIVE_ALLOCATION_CYCLE,
      run: () => this.liveAllocator.check(),
    };
    createWorker(liveAllocationTask, cronOpts, this.runner);
    // this.scheduler.addPeriodTask(liveAllocationTask, DEFAULT_LIVE_ALLOCATION_CYCLE, true);
  }
}
