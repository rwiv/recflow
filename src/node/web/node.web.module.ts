import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { NodeServiceModule } from '../service/node.service.module.js';
import { NodeGroupController } from './node-group.controller.js';
import { NodeController } from './node.controller.js';
import { RecnodeModule } from '../../external/recnode/recnode.module.js';

@Module({
  imports: [ConfigModule, NodeServiceModule, RecnodeModule],
  controllers: [NodeController, NodeGroupController],
})
export class NodeWebModule {}
