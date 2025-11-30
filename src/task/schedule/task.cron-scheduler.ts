import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { JobsOptions } from 'bullmq/dist/esm/types/index.js';
import { Redis } from 'ioredis';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { handleSettled } from '@/utils/log.js';

import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { TASK_REDIS } from '@/infra/infra.tokens.js';

import { LIVE_REGISTER_CRITERION_DEF, LIVE_REGISTER_CRITERION_NAME } from '@/task/live/live.task.contants.js';
import { TaskLockManager } from '@/task/schedule/task-lock.manager.js';
import { TaskErrorHandler } from '@/task/schedule/task.error-handler.js';
import { getJobOpts } from '@/task/schedule/task.utils.js';
import { cronTaskDefs } from '@/task/spec/task.queue-defs.js';
import { LockSchema, TaskDef, TaskMeta } from '@/task/spec/task.schema.js';

import { CriterionFinder } from '@/criterion/service/criterion.finder.js';
import { PlatformCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

@Injectable()
export class TaskCronScheduler {
  private readonly jobOpts: JobsOptions;
  private readonly queues: Map<string, Queue> = new Map();

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly lm: TaskLockManager,
    private readonly eh: TaskErrorHandler,
    private readonly crFinder: CriterionFinder,
  ) {
    this.jobOpts = getJobOpts(this.env);
  }

  @Cron('* * * * * *')
  async handleCron() {
    try {
      await this.check();
    } catch (e) {
      this.eh.handle(e);
    }
  }

  async check() {
    const ps1: Promise<void>[] = [];
    for (const [taskName, taskDef] of Object.entries(cronTaskDefs)) {
      ps1.push(this.checkTask(taskName, taskDef));
    }
    handleSettled(await Promise.allSettled(ps1));

    const ps2: Promise<void>[] = [];
    const criteria = (await this.crFinder.findAll()).filter((cr) => !cr.isDeactivated);
    for (const cr of criteria) {
      ps2.push(this.checkCriterion(cr));
    }
    handleSettled(await Promise.allSettled(ps2));
  }

  private async checkTask(taskName: string, taskDef: TaskDef) {
    const lockToken = await this.lm.acquire(taskName, taskDef.ex);
    if (!lockToken) {
      return;
    }
    const lock: LockSchema = { name: taskName, token: lockToken };
    const meta: TaskMeta = { lock, delay: taskDef.delay };
    await this.getQueue(taskName).add(taskName, { meta }, this.jobOpts);
  }

  private async checkCriterion(cr: PlatformCriterionDto) {
    const taskName = LIVE_REGISTER_CRITERION_NAME;
    const lockKey = `${taskName}_${cr.name}`;

    const lockToken = await this.lm.acquire(lockKey, LIVE_REGISTER_CRITERION_DEF.ex);
    if (!lockToken) {
      return;
    }
    const lock: LockSchema = { name: lockKey, token: lockToken };
    const meta: TaskMeta = { lock, delay: LIVE_REGISTER_CRITERION_DEF.delay };
    const data = { meta, args: { crId: cr.id } };
    await this.getQueue(taskName).add(lockKey, data, this.jobOpts);
  }

  private getQueue(key: string) {
    if (!this.queues.has(key)) {
      this.queues.set(key, new Queue(key, { connection: this.redis }));
    }
    const queue = this.queues.get(key);
    if (!queue) {
      throw NotFoundError.from('Queue', 'name', key);
    }
    return queue;
  }
}
