import { Module } from '@nestjs/common';
import { TaskScheduler } from './task.scheduler.js';
import { TaskErrorHandler } from './task.error-handler.js';

@Module({
  providers: [TaskScheduler, TaskErrorHandler],
  exports: [TaskScheduler],
})
export class TaskSchedulerModule {}
