import { TaskLockManager } from './task-lock.manager.js';
import { Queue } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { TASK_REDIS } from '../../infra/infra.tokens.js';
import { Redis } from 'ioredis';

const DEFAULT_TASK_EX = 3 * 60; // TODO: move config

@Injectable()
export class TaskRegistrar {
  constructor(
    @Inject(TASK_REDIS) private readonly redis: Redis,
    private readonly lm: TaskLockManager,
  ) {}

  async check(taskNames: string[]) {
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
