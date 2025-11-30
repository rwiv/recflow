import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { RecnodeModule } from '@/external/recnode/recnode.module.js';

import { NodeServiceModule } from '@/node/service/node.service.module.js';
import { NodeGroupController } from '@/node/web/node-group.controller.js';
import { NodeController } from '@/node/web/node.controller.js';

@Module({
  imports: [ConfigModule, NodeServiceModule, RecnodeModule],
  controllers: [NodeController, NodeGroupController],
})
export class NodeWebModule {}
