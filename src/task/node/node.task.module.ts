import { Module } from '@nestjs/common';
import { NodeTaskInitializer } from './node.task.initializer.js';
import { TaskSchedulerModule } from '../schedule/task.schedule.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { ConfigModule } from '../../common/config/config.module.js';

@Module({
  imports: [TaskSchedulerModule, ConfigModule, NodeServiceModule],
  providers: [NodeTaskInitializer],
  exports: [NodeTaskInitializer],
})
export class NodeTaskModule {}
