import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { NodeServiceModule } from '../service/node.service.module.js';
import { NodeGroupController } from './node-group.controller.js';
import { NodeController } from './node.controller.js';
import { StdlModule } from '../../external/stdl/stdl.module.js';

@Module({
  imports: [ConfigModule, NodeServiceModule, StdlModule],
  controllers: [NodeController, NodeGroupController],
})
export class NodeWebModule {}
