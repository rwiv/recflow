import { Module } from '@nestjs/common';
import { TaskErrorHandler } from './task.error-handler.js';
import { TaskLockManager } from './task-lock.manager.js';
import { InfraModule } from '../../infra/infra.module.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { TaskRunner } from './task.runner.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { TaskCronScheduler } from './task.cron-scheduler.js';

@Module({
  imports: [InfraModule, ConfigModule, CriterionServiceModule],
  providers: [TaskErrorHandler, TaskLockManager, TaskRunner, TaskCronScheduler],
  exports: [TaskLockManager, TaskRunner, TaskCronScheduler],
})
export class TaskSchedulerModule {}
