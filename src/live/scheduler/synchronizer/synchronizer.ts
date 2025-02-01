import { log } from 'jslog';

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
      // TODO: use ntfy
      console.error(e);
    }

    this.isChecking = false;
  }

  protected abstract check(): Promise<void>;
}
