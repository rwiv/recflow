import { Module } from '@nestjs/common';
import { TaskSchedulerModule } from './schedule/task.schedule.module.js';
import { LiveTaskModule } from './live/live.task.module.js';
import { ChannelTaskModule } from './channel/channel.task.module.js';
import { NodeTaskModule } from './node/node.task.module.js';

@Module({
  imports: [TaskSchedulerModule, LiveTaskModule, ChannelTaskModule, NodeTaskModule],
})
export class TaskModule {}
