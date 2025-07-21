import { Module } from '@nestjs/common';
import { ChannelTaskInitializer } from './channel.task.initializer.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [InfraModule, TaskSchedulerModule, ChannelServiceModule],
  providers: [ChannelTaskInitializer],
  exports: [ChannelTaskInitializer],
})
export class ChannelTaskModule {}
