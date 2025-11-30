import { Module } from '@nestjs/common';

import { ChannelTaskModule } from '@/task/channel/channel.task.module.js';
import { LiveTaskModule } from '@/task/live/live.task.module.js';
import { NodeTaskModule } from '@/task/node/node.task.module.js';
import { TaskSchedulerModule } from '@/task/schedule/task.schedule.module.js';

@Module({
  imports: [TaskSchedulerModule, LiveTaskModule, ChannelTaskModule, NodeTaskModule],
})
export class TaskModule {}
