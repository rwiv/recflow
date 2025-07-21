import { TaskLockManager } from './task-lock.manager.js';
import { Queue } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { liveTaskName } from '../live/spec/live.task.names.js';

const DEFAULT_TASK_EX = 3 * 60; // TODO: move config

@Injectable()
export class TaskRegistrar {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly lm: TaskLockManager,
    private readonly crFinder: CriterionFinder,
  ) {}

  async check(taskNames: string[]) {
    const criteria = (await this.crFinder.findAll()).filter((cr) => !cr.isDeactivated);
    for (const cr of criteria) {
      const queueName = liveTaskName.LIVE_REGISTER;
      const lockName = `${queueName}_${cr.name}`;

      const lock = await this.lm.acquire(lockName, DEFAULT_TASK_EX);
      if (!lock) {
        continue;
      }
      const queue = new Queue(queueName, { connection: this.redis });
      await queue.add(lockName, { lock, crId: cr.id });
    }

    for (const taskName of taskNames) {
      const lock = await this.lm.acquire(taskName, DEFAULT_TASK_EX);
      if (!lock) {
        continue;
      }
      const queue = new Queue(taskName, { connection: this.redis });
      await queue.add(taskName, { lock });
    }
  }
}
