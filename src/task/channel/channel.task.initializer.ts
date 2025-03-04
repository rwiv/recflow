import { Injectable } from '@nestjs/common';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { ChannelRefreshTask } from './channel.refresh.task.js';
import { TaskScheduler } from '../schedule/task.scheduler.js';
import { DEFAULT_CHANNEL_REFRESH_CYCLE } from './channel.tasks.constants.js';

@Injectable()
export class ChannelTaskInitializer {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly scheduler: TaskScheduler,
  ) {}

  init() {
    const task = new ChannelRefreshTask(this.chWriter);
    this.scheduler.addPeriodTask(task, DEFAULT_CHANNEL_REFRESH_CYCLE, true);
  }
}
