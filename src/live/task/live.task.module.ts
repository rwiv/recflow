import { Module } from '@nestjs/common';
import { LivePeriodTaskManager } from './live.task.manger.js';
import { LiveRegistryModule } from '../registry/live.registry.module.js';
import { LiveAccessModule } from '../access/live.access.module.js';
import { TaskModule } from '../../task/task.module.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';

@Module({
  imports: [CriterionServiceModule, LiveAccessModule, LiveRegistryModule, TaskModule],
  providers: [LivePeriodTaskManager],
  exports: [LivePeriodTaskManager],
})
export class LiveTaskModule {}
