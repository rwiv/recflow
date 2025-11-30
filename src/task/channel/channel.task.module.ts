import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/infra.module.js';

import { ChannelTaskInitializer } from '@/task/channel/channel.task.initializer.js';
import { TaskSchedulerModule } from '@/task/schedule/task.schedule.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';

@Module({
  imports: [InfraModule, TaskSchedulerModule, ChannelServiceModule],
  providers: [ChannelTaskInitializer],
  exports: [ChannelTaskInitializer],
})
export class ChannelTaskModule {}
