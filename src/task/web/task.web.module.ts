import { Module } from '@nestjs/common';
import { TaskController } from './task.controller.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveRegistryModule } from '../../live/registry/live.registry.module.js';

@Module({
  imports: [ConfigModule, TaskSchedulerModule, LiveRegistryModule],
  controllers: [TaskController],
})
export class TaskWebModule {}
