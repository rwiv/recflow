import { Injectable } from '@nestjs/common';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import {
  channelTaskName,
  DEFAULT_CHANNEL_CACHE_CHECK_CYCLE,
  DEFAULT_CHANNEL_REFRESH_CYCLE,
} from './channel.tasks.constants.js';
import { ChannelCacheChecker } from '../../channel/service/channel.cache.checker.js';
import { Task } from '../spec/task.interface.js';

@Injectable()
export class ChannelTaskInitializer {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly scheduler: TaskScheduler,
    private readonly checker: ChannelCacheChecker,
  ) {}

  init() {
    const refreshTask: Task = {
      name: channelTaskName.CHANNEL_REFRESH,
      run: () => this.chWriter.refresh(),
    };
    this.scheduler.addPeriodTask(refreshTask, DEFAULT_CHANNEL_REFRESH_CYCLE, true);

    const cacheCheckTask: Task = {
      name: channelTaskName.CHANNEL_CACHE_CHECK,
      run: () => this.checker.checkCache(),
    };
    this.scheduler.addPeriodTask(cacheCheckTask, DEFAULT_CHANNEL_CACHE_CHECK_CYCLE, true);
  }
}
