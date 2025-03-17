import { Module } from '@nestjs/common';
import { TaskController } from './task.controller.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { ConfigModule } from '../../common/config/config.module.js';

@Module({
  imports: [ConfigModule, TaskSchedulerModule],
  controllers: [TaskController],
})
export class TaskWebModule {}
