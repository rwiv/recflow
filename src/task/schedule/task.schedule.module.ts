import { Module } from '@nestjs/common';
import { TaskScheduler } from './task.scheduler.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { TaskLockManager } from './task-lock.manager.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [InfraModule],
  providers: [TaskScheduler, TaskErrorHandler, TaskLockManager],
  exports: [TaskScheduler, TaskLockManager],
})
export class TaskSchedulerModule {}
