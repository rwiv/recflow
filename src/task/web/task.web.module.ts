import { Module } from '@nestjs/common';
import { TaskController } from './task.controller.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';

@Module({
  imports: [TaskSchedulerModule],
  controllers: [TaskController],
})
export class TaskWebModule {}
