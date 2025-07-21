import { Task } from '../spec/task.interface.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { TaskLockManager } from './task-lock.manager.js';
import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { delay } from 'src/utils/time.js';
import { TaskMeta } from '../spec/task.schema.js';

@Injectable()
export class TaskRunner {
  constructor(
    private readonly eh: TaskErrorHandler,
    private readonly lm: TaskLockManager,
  ) {}

  async run(meta: TaskMeta, task: Task) {
    try {
      if (meta.lock !== null) {
        const lock = await this.lm.get(task.name);
        if (lock !== meta.lock) {
          log.error('Failed to start Task: Lock token mismatch', { taskName: task.name });
        }
      }

      await task.run();
      if (meta.delay) {
        await delay(meta.delay);
      }

      if (meta.lock !== null) {
        const ok = await this.lm.release(task.name, meta.lock);
        if (ok === null) {
          log.error('Failed to release Task: Lock token not found', { taskName: task.name });
        }
        if (ok === false) {
          log.error('Failed to release Task: Lock token mismatch', { taskName: task.name });
        }
      }
    } catch (e) {
      this.eh.handle(e);
    }
  }
}
