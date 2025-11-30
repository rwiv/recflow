import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { log } from 'jslog';

import { delay } from '@/utils/time.js';

import { TaskLockManager } from '@/task/schedule/task-lock.manager.js';
import { TaskErrorHandler } from '@/task/schedule/task.error-handler.js';
import { Task } from '@/task/spec/task.interface.js';
import { LockSchema, taskMeta } from '@/task/spec/task.schema.js';

@Injectable()
export class TaskRunner {
  constructor(
    private readonly eh: TaskErrorHandler,
    private readonly lm: TaskLockManager,
  ) {}

  async run(task: Task, job: Job) {
    const meta = taskMeta.parse(job.data?.meta);
    const { lock, delay: delayMs } = meta;
    const args = job.data?.args;

    if (lock) {
      const lockToken = await this.lm.get(lock.name);
      if (lockToken !== lock.token) {
        log.warn('Failed to start Task: Lock token mismatch', lock);
        return;
      }

      if (job.stalledCounter > 0) {
        log.warn('Release stalled task', lock);
        await this.releaseLock(lock);
        return;
      }
    }

    try {
      await task.run(args);

      if (delayMs) {
        await delay(delayMs);
      }
      if (lock) {
        await this.releaseLock(lock);
      }
    } catch (e) {
      if (delayMs) {
        await delay(delayMs);
      }
      if (lock) {
        await this.releaseLock(lock);
      }
      this.eh.handle(e);
    }
  }

  async releaseLock(lock: LockSchema) {
    const ok = await this.lm.release(lock.name, lock.token);
    if (ok === null) {
      log.error('Failed to release Task: Lock token not found', lock);
    }
    if (ok === false) {
      log.error('Failed to release Task: Lock token mismatch', lock);
    }
  }
}
