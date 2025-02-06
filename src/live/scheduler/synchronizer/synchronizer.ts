import { log } from 'jslog';
import { ScheduleErrorHandler } from '../error.handler.js';

export abstract class Synchronizer {
  private isChecking: boolean = false;

  protected constructor(private readonly eh: ScheduleErrorHandler) {}

  async sync() {
    if (this.isChecking) {
      log.info('Already checking');
      return;
    }
    this.isChecking = true;

    try {
      await this.check();
    } catch (e) {
      this.eh.handle(e);
    }

    this.isChecking = false;
  }

  protected abstract check(): Promise<void>;
}
