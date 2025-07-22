import { TaskLockManager } from './task-lock.manager.js';
import { Queue } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { delay } from '../../utils/time.js';
import { cronTaskDefs } from '../spec/task.queue-defs.js';
import { LockSchema, TaskMeta } from '../spec/task.schema.js';
import { LIVE_REGISTER_CRITERION_DEF, LIVE_REGISTER_CRITERION_NAME } from '../live/live.task.contants.js';
import { JobsOptions } from 'bullmq/dist/esm/types/index.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

@Injectable()
export class TaskCronScheduler {
  private readonly jobOpts: JobsOptions;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly lm: TaskLockManager,
    private readonly crFinder: CriterionFinder,
  ) {
    if (this.env.nodeEnv === 'prod') {
      this.jobOpts = { removeOnComplete: 100, removeOnFail: 10 };
    } else {
      this.jobOpts = { removeOnComplete: 10, removeOnFail: 3 };
    }
  }

  async check() {
    while (true) {
      await this.checkOne();
      await delay(1000);
    }
  }

  async checkOne() {
    const criteria = (await this.crFinder.findAll()).filter((cr) => !cr.isDeactivated);
    for (const cr of criteria) {
      const taskName = LIVE_REGISTER_CRITERION_NAME;
      const lockKey = `${taskName}_${cr.name}`;

      const lockToken = await this.lm.acquire(lockKey, LIVE_REGISTER_CRITERION_DEF.ex);
      if (!lockToken) {
        continue;
      }
      const queue = new Queue(taskName, { connection: this.redis });
      const lock: LockSchema = { name: lockKey, token: lockToken };
      const meta: TaskMeta = { lock, delay: LIVE_REGISTER_CRITERION_DEF.delay };
      const data = { meta, args: { crId: cr.id } };
      await queue.add(lockKey, data, this.jobOpts);
    }

    for (const [taskName, taskDef] of Object.entries(cronTaskDefs)) {
      const lockToken = await this.lm.acquire(taskName, taskDef.ex);
      if (!lockToken) {
        continue;
      }
      const queue = new Queue(taskName, { connection: this.redis });
      const lock: LockSchema = { name: taskName, token: lockToken };
      const meta: TaskMeta = { lock, delay: taskDef.delay };
      await queue.add(taskName, { meta }, this.jobOpts);
    }
  }
}
