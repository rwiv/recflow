import { TaskLockManager } from './task-lock.manager.js';
import { Queue } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';
import { CriterionFinder } from '../../criterion/service/criterion.finder.js';
import { liveTaskName } from '../live/live.task.names.js';
import { delay } from '../../utils/time.js';
import { queueNames } from '../spec/task.queue-names.js';
import { LockSchema } from '../spec/task.schema.js';

const DEFAULT_TASK_EX = 60; // TODO: move config

@Injectable()
export class TaskRegistrar {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly lm: TaskLockManager,
    private readonly crFinder: CriterionFinder,
  ) {}

  async check() {
    while (true) {
      await this.checkOne();
      await delay(1000);
    }
  }

  async checkOne() {
    const criteria = (await this.crFinder.findAll()).filter((cr) => !cr.isDeactivated);
    for (const cr of criteria) {
      const queueName = liveTaskName.LIVE_REGISTER_CRITERION;
      const lockKey = `${queueName}_${cr.name}`;

      const lockToken = await this.lm.acquire(lockKey, DEFAULT_TASK_EX);
      if (!lockToken) {
        continue;
      }
      const queue = new Queue(queueName, { connection: this.redis });
      const lock: LockSchema = { name: lockKey, token: lockToken };
      const data = { meta: { lock }, args: { crId: cr.id } };
      await queue.add(lockKey, data);
    }

    for (const queueName of queueNames) {
      const lockToken = await this.lm.acquire(queueName, DEFAULT_TASK_EX);
      if (!lockToken) {
        continue;
      }
      const queue = new Queue(queueName, { connection: this.redis });
      const lock: LockSchema = { name: queueName, token: lockToken };
      const data = { meta: { lock } };
      await queue.add(queueName, data);
    }
  }
}
