import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { InfraModule } from '@/infra/infra.module.js';

import { TaskLockManager } from '@/task/schedule/task-lock.manager.js';
import { TaskCronScheduler } from '@/task/schedule/task.cron-scheduler.js';
import { TaskErrorHandler } from '@/task/schedule/task.error-handler.js';
import { TaskRunner } from '@/task/schedule/task.runner.js';

import { CriterionServiceModule } from '@/criterion/service/criterion.service.module.js';

@Module({
  imports: [InfraModule, ConfigModule, CriterionServiceModule],
  providers: [TaskErrorHandler, TaskLockManager, TaskRunner, TaskCronScheduler],
  exports: [TaskLockManager, TaskRunner, TaskCronScheduler],
})
export class TaskSchedulerModule {}
