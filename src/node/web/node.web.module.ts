import { Module } from '@nestjs/common';
import { NodeServiceModule } from '../service/node.service.module.js';
import { NodeController } from './node.controller.js';
import { NodeGroupController } from './node-group.controller.js';

@Module({
  imports: [NodeServiceModule],
  controllers: [NodeController, NodeGroupController],
})
export class NodeWebModule {}
