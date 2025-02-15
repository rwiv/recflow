import { z } from 'zod';
import { delay } from '../../utils/time.js';
import { Task } from '../spec/task.interface.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { log } from 'jslog';
import * as util from 'node:util';

export const periodTaskStatus = z.enum(['active', 'inactive', 'canceled']);
export type PeriodTaskStatus = z.infer<typeof periodTaskStatus>;

const delayMsSchema = z.number().int().positive();

const SLEEP_DELAY_MS = 100;

export class PeriodTask {
  public readonly taskName: string;

  public executionCnt: number = 0;

  private status: PeriodTaskStatus = 'inactive';
  private cancelFlag = false;
  private promise: Promise<string> | null = null;

  constructor(
    private readonly task: Task,
    public readonly delayMs: number,
    private readonly eh: TaskErrorHandler,
  ) {
    if (!delayMsSchema.parse(delayMs)) {
      throw new ValidationError('delayMs must be a positive integer');
    }
    this.taskName = task.name;
  }

  getStatus() {
    return this.status;
  }

  getPromiseState() {
    return util.inspect(this.promise);
  }

  start() {
    this.promise = this._start();
  }

  cancel() {
    this.cancelFlag = true;
  }

  private async _start() {
    log.info(`PeriodTask started: name=${this.task.name}`);
    this.status = 'active';

    await this.run();

    let cnt = 0;
    while (true) {
      if (this.cancelFlag) {
        break;
      }
      await delay(SLEEP_DELAY_MS);
      cnt++;
      if (cnt >= this.delayMs / SLEEP_DELAY_MS) {
        cnt = 0;
        await this.run();
        this.executionCnt++;
      }
    }

    this.status = 'canceled';
    log.info(`PeriodTask canceled: name=${this.task.name}`);
    return 'done';
  }

  private async run() {
    try {
      await this.task.run();
    } catch (e) {
      this.eh.handle(e);
    }
  }
}
