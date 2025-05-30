import { Task } from '../../spec/task.interface.js';
import { liveTaskName } from '../spec/live.task.names.js';
import { LiveAllocator } from '../../../live/registry/live.allocator.js';

export class LiveAllocationTask implements Task {
  public readonly name = liveTaskName.LIVE_ALLOCATION;

  constructor(private readonly liveAllocator: LiveAllocator) {}

  async run(): Promise<void> {
    await this.liveAllocator.check();
  }
}
