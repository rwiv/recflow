import { log } from 'jslog';
import { FatalError } from '../../../utils/errors/errors/FatalError.js';

export abstract class Synchronizer {
  private isChecking: boolean = false;

  async sync() {
    if (this.isChecking) {
      log.info('Already checking');
      return;
    }
    this.isChecking = true;

    try {
      await this.check();
    } catch (e) {
      throw new FatalError('Failed to sync', { cause: e });
    }

    this.isChecking = false;
  }

  protected abstract check(): Promise<void>;
}
