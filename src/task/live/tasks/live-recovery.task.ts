import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveRecoveryManager } from '../../../live/registry/live.recovery.manager.js';

export class LiveRecoveryTask implements Task {
  public readonly name = liveTaskName.LIVE_RECOVERY;

  constructor(private readonly liveRecoveryManager: LiveRecoveryManager) {}

  async run(): Promise<void> {
    await this.liveRecoveryManager.check();
  }
}
