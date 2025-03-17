import { Module } from '@nestjs/common';
import { NodeServiceModule } from '../service/node.service.module.js';
import { NodeController } from './node.controller.js';
import { NodeGroupController } from './node-group.controller.js';
import { ConfigModule } from '../../common/config/config.module.js';

@Module({
  imports: [ConfigModule, NodeServiceModule],
  controllers: [NodeController, NodeGroupController],
})
export class NodeWebModule {}
