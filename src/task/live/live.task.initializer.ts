import { Inject, Injectable } from '@nestjs/common';
import { WorkerOptions } from 'bullmq/dist/esm/interfaces/index.js';
import { Redis } from 'ioredis';

import { TASK_REDIS } from '@/infra/infra.tokens.js';

import { LiveRegisterTask } from '@/task/live/live.register-task.js';
import {
  LIVE_ALLOCATION_NAME,
  LIVE_CLEANUP_NAME,
  LIVE_FINISH_NAME,
  LIVE_INVALID_RECOVERY_NAME,
  LIVE_RECOVERY_NAME,
  LIVE_REFRESH_NAME,
  LIVE_REGISTER_FOLLOWED_NAME,
  LIVE_STATE_CLEANUP_NAME,
} from '@/task/live/live.task.contants.js';
import { TaskRunner } from '@/task/schedule/task.runner.js';
import { createWorker } from '@/task/schedule/task.utils.js';
import { Task } from '@/task/spec/task.interface.js';

import { CriterionFinder } from '@/criterion/service/criterion.finder.js';

import { LiveBalancer } from '@/live/coord/live.balancer.js';
import { LiveCleaner } from '@/live/coord/live.cleaner.js';
import { LiveRecoveryManager } from '@/live/coord/live.recovery.js';
import { LiveRefresher } from '@/live/data/live.refresher.js';
import { LiveStateCleaner } from '@/live/data/live.state.cleaner.js';
import { LiveDetector } from '@/live/detection/live.detector.js';
import { LiveFinalizer, liveFinishRequest } from '@/live/register/live.finalizer.js';

@Injectable()
export class LiveTaskInitializer {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly runner: TaskRunner,
    private readonly crFinder: CriterionFinder,
    private readonly liveDetector: LiveDetector,
    private readonly liveCleaner: LiveCleaner,
    private readonly liveRefresher: LiveRefresher,
    private readonly liveStateCleaner: LiveStateCleaner,
    private readonly liveRecoveryManager: LiveRecoveryManager,
    private readonly liveBalancer: LiveBalancer,
    private readonly liveFinalizer: LiveFinalizer,
  ) {}

  init() {
    const cronOpts: WorkerOptions = { connection: this.redis, concurrency: 1 };
    const batchOpts: WorkerOptions = { connection: this.redis, concurrency: 30 };

    const cleanupTask: Task = {
      name: LIVE_CLEANUP_NAME,
      run: () => this.liveCleaner.cleanup(),
    };
    createWorker(cleanupTask, cronOpts, this.runner);

    const refreshTask: Task = {
      name: LIVE_REFRESH_NAME,
      run: () => this.liveRefresher.refreshEarliestOne(),
    };
    createWorker(refreshTask, cronOpts, this.runner);

    const recoveryTask: Task = {
      name: LIVE_RECOVERY_NAME,
      run: () => this.liveRecoveryManager.checkLives(),
    };
    createWorker(recoveryTask, cronOpts, this.runner);

    const invalidRecoveryTask: Task = {
      name: LIVE_INVALID_RECOVERY_NAME,
      run: () => this.liveRecoveryManager.checkInvalidLives(),
    };
    createWorker(invalidRecoveryTask, cronOpts, this.runner);

    const liveStateCleanupTask: Task = {
      name: LIVE_STATE_CLEANUP_NAME,
      run: () => this.liveStateCleaner.cleanup(),
    };
    createWorker(liveStateCleanupTask, cronOpts, this.runner);

    const liveAllocationTask: Task = {
      name: LIVE_ALLOCATION_NAME,
      run: () => this.liveBalancer.check(),
    };
    createWorker(liveAllocationTask, cronOpts, this.runner);

    const followedRegisterTask: Task = {
      name: LIVE_REGISTER_FOLLOWED_NAME,
      run: () => this.liveDetector.checkFollowedLives(),
    };
    createWorker(followedRegisterTask, cronOpts, this.runner);

    const registerTask = new LiveRegisterTask(this.crFinder, this.liveDetector);
    createWorker(registerTask, batchOpts, this.runner);

    const liveFinishTask: Task = {
      name: LIVE_FINISH_NAME,
      run: (args: any) => this.liveFinalizer.finishLive(liveFinishRequest.parse(args)),
    };
    createWorker(liveFinishTask, batchOpts, this.runner);
  }
}
