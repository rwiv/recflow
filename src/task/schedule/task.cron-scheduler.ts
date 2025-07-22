import { Cron } from '@nestjs/schedule';
import { Inject, Injectable } from '@nestjs/common';
import { TaskLockManager } from './task-lock.manager.js';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { cronTaskDefs } from '../spec/task.queue-defs.js';
import { LockSchema, TaskDef, TaskMeta } from '../spec/task.schema.js';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LIVE_REGISTER_CRITERION_DEF, LIVE_REGISTER_CRITERION_NAME } from '../live/live.task.contants.js';
import { JobsOptions } from 'bullmq/dist/esm/types/index.js';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { getJobOpts } from './task.utils.js';

@Injectable()
export class TaskCronScheduler {
  private readonly jobOpts: JobsOptions;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly lm: TaskLockManager,
    private readonly crFinder: CriterionFinder,
  ) {
    this.jobOpts = getJobOpts(this.env);
  }

  @Cron('* * * * * *')
  async handleCron() {
    await this.checkOne();
  }

  async checkOne() {
    const promises: Promise<void>[] = [];

    for (const [taskName, taskDef] of Object.entries(cronTaskDefs)) {
      promises.push(this.checkTask(taskName, taskDef));
    }

    const criteria = (await this.crFinder.findAll()).filter((cr) => !cr.isDeactivated);
    for (const cr of criteria) {
      promises.push(this.checkCriterion(cr));
    }

    await Promise.allSettled(promises);
  }

  private async checkTask(taskName: string, taskDef: TaskDef) {
    const lockToken = await this.lm.acquire(taskName, taskDef.ex);
    if (!lockToken) {
      return;
    }
    const queue = new Queue(taskName, { connection: this.redis });
    const lock: LockSchema = { name: taskName, token: lockToken };
    const meta: TaskMeta = { lock, delay: taskDef.delay };
    await queue.add(taskName, { meta }, this.jobOpts);
  }

  private async checkCriterion(cr: PlatformCriterionDto) {
    const taskName = LIVE_REGISTER_CRITERION_NAME;
    const lockKey = `${taskName}_${cr.name}`;

    const lockToken = await this.lm.acquire(lockKey, LIVE_REGISTER_CRITERION_DEF.ex);
    if (!lockToken) {
      return;
    }
    const queue = new Queue(taskName, { connection: this.redis });
    const lock: LockSchema = { name: lockKey, token: lockToken };
    const meta: TaskMeta = { lock, delay: LIVE_REGISTER_CRITERION_DEF.delay };
    const data = { meta, args: { crId: cr.id } };
    await queue.add(lockKey, data, this.jobOpts);
  }
}
