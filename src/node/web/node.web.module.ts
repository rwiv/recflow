import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { InfraModule } from '../../infra/infra.module.js';
import { NodeServiceModule } from '../service/node.service.module.js';
import { NodeGroupController } from './node-group.controller.js';
import { NodeController } from './node.controller.js';

@Module({
  imports: [ConfigModule, InfraModule, NodeServiceModule],
  controllers: [NodeController, NodeGroupController],
})
export class NodeWebModule {}
