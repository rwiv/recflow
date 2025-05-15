import { Task } from '../spec/task.interface.js';
import { channelTaskName } from './channel.tasks.constants.js';
import { ChannelCacheChecker } from '../../channel/service/channel.cache.checker.js';

export class ChannelCacheCheckTask implements Task {
  public readonly name: string;

  constructor(private readonly checker: ChannelCacheChecker) {
    this.name = channelTaskName.CHANNEL_CACHE_CHECK;
  }

  async run(): Promise<void> {
    await this.checker.checkCache();
  }
}
