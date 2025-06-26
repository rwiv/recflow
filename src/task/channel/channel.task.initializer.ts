import { Injectable } from '@nestjs/common';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { ChannelRefreshTask } from './channel.refresh.task.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { DEFAULT_CHANNEL_CACHE_CHECK_CYCLE, DEFAULT_CHANNEL_REFRESH_CYCLE } from './channel.tasks.constants.js';
import { ChannelCacheCheckTask } from './channel.cache-check.task.js';
import { ChannelCacheChecker } from '../../channel/service/channel.cache.checker.js';

@Injectable()
export class ChannelTaskInitializer {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly scheduler: TaskScheduler,
    private readonly checker: ChannelCacheChecker,
  ) {}

  init() {
    const refreshTask = new ChannelRefreshTask(this.chWriter);
    this.scheduler.addPeriodTask(refreshTask, DEFAULT_CHANNEL_REFRESH_CYCLE, true);

    const cacheCheckTask = new ChannelCacheCheckTask(this.checker);
    this.scheduler.addPeriodTask(cacheCheckTask, DEFAULT_CHANNEL_CACHE_CHECK_CYCLE, true);
  }
}
