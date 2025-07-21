import { Module } from '@nestjs/common';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';
import { LiveDataModule } from '../../live/data/live.data.module.js';
import { LiveRegistryModule } from '../../live/registry/live.registry.module.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { LiveTaskInitializer } from './live.task.initializer.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [InfraModule, CriterionServiceModule, LiveDataModule, LiveRegistryModule, TaskSchedulerModule],
  providers: [LiveTaskInitializer],
  exports: [LiveTaskInitializer],
})
export class LiveTaskModule {}
