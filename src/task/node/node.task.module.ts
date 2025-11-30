import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/infra.module.js';

import { NodeTaskInitializer } from '@/task/node/node.task.initializer.js';
import { TaskSchedulerModule } from '@/task/schedule/task.schedule.module.js';

import { NodeServiceModule } from '@/node/service/node.service.module.js';

import { LiveCoordinationModule } from '@/live/coord/live.coordination.module.js';

@Module({
  imports: [InfraModule, TaskSchedulerModule, NodeServiceModule, LiveCoordinationModule],
  providers: [NodeTaskInitializer],
  exports: [NodeTaskInitializer],
})
export class NodeTaskModule {}
