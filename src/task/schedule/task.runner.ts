import { Task } from '../spec/task.interface.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { TaskLockManager } from './task-lock.manager.js';
import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { LockSchema, TaskMeta } from '../spec/task.schema.js';
import { delay } from '../../utils/time.js';

@Injectable()
export class TaskRunner {
  constructor(
    private readonly eh: TaskErrorHandler,
    private readonly lm: TaskLockManager,
  ) {}

  async run(task: Task, meta: TaskMeta, args: any) {
    try {
      if (meta.lock !== null) {
        const lockToken = await this.lm.get(meta.lock.name);
        if (lockToken !== meta.lock.token) {
          log.error('Failed to start Task: Lock token mismatch', { taskName: task.name });
          throw Error('Lock token mismatch');
        }
      }

      await task.run(args);
      if (meta.delay) {
        await delay(meta.delay);
      }

      if (meta.lock !== null) {
        await this.releaseLock(meta.lock);
      }
    } catch (e) {
      if (meta.delay) {
        await delay(meta.delay);
      }
      if (meta.lock !== null) {
        await this.releaseLock(meta.lock);
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
      log.error('Failed to release Task: Lock token mismatch', { lock });
    }
  }
}
