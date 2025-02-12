import { Module } from '@nestjs/common';
import { TaskScheduler } from './schedule/task.scheduler.js';
import { TaskErrorHandler } from './schedule/task.error-handler.js';

@Module({
  providers: [TaskScheduler, TaskErrorHandler],
  exports: [TaskScheduler],
})
export class TaskModule {}
