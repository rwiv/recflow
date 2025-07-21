import { Module } from '@nestjs/common';
import { TaskScheduler } from './task.scheduler.js';
import { TaskErrorHandler } from './task.error-handler.js';
import { TaskLockManager } from './task-lock.manager.js';
import { InfraModule } from '../../infra/infra.module.js';
import { TaskRunner } from './task.runner.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';

@Module({
  imports: [InfraModule, CriterionServiceModule],
  providers: [TaskScheduler, TaskErrorHandler, TaskLockManager, TaskRunner],
  exports: [TaskScheduler, TaskLockManager, TaskRunner],
})
export class TaskSchedulerModule {}
