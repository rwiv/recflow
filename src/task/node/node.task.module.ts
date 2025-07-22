import { Module } from '@nestjs/common';
import { NodeTaskInitializer } from './node.task.initializer.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveRegistryModule } from '../../live/registry/live.registry.module.js';

@Module({
  imports: [InfraModule, TaskSchedulerModule, NodeServiceModule, LiveRegistryModule],
  providers: [NodeTaskInitializer],
  exports: [NodeTaskInitializer],
})
export class NodeTaskModule {}
