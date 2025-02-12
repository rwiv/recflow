import { z } from 'zod';
import { delay } from '../../utils/time.js';
import { Task } from '../spec/task.interface.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { log } from 'jslog';

export const periodTaskStatus = z.enum(['active', 'inactive', 'canceled']);
export type PeriodTaskStatus = z.infer<typeof periodTaskStatus>;

const delayMsSchema = z.number().int().positive();

export class PeriodTask {
  private status: PeriodTaskStatus = 'inactive';
  private cancelFlag = false;

  constructor(
    private readonly task: Task,
    private readonly delayMs: number,
    private readonly eh: TaskErrorHandler,
  ) {
    if (!delayMsSchema.parse(delayMs)) {
      throw new ValidationError('delayMs must be a positive integer');
    }
  }

  getStatus() {
    return this.status;
  }

  async start() {
    this.status = 'active';
    while (true) {
      if (this.cancelFlag) {
        break;
      }
      try {
        await this.task.run();
      } catch (e) {
        this.eh.handle(e);
      }
      await delay(this.delayMs);
    }
    this.status = 'canceled';
    log.info(`PeriodTask canceled: name=${this.task.getName()}`);
  }

  cancel() {
    this.cancelFlag = true;
  }
}
