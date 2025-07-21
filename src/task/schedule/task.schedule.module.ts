import { Module } from '@nestjs/common';
import { TaskErrorHandler } from './task.error-handler.js';
import { TaskLockManager } from './task-lock.manager.js';
import { InfraModule } from '../../infra/infra.module.js';
import { TaskRunner } from './task.runner.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { TaskRegistrar } from './task.registrar.js';

@Module({
  imports: [InfraModule, CriterionServiceModule],
  providers: [TaskErrorHandler, TaskLockManager, TaskRunner, TaskRegistrar],
  exports: [TaskLockManager, TaskRunner, TaskRegistrar],
})
export class TaskSchedulerModule {}
