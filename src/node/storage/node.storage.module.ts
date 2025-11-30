import { Module } from '@nestjs/common';

import { LiveNodeRepository } from '@/node/storage/live-node.repository.js';
import { NodeGroupRepository } from '@/node/storage/node-group.repository.js';
import { NodeRepository } from '@/node/storage/node.repository.js';

@Module({
  imports: [],
  providers: [NodeRepository, NodeGroupRepository, LiveNodeRepository],
  exports: [NodeRepository, NodeGroupRepository, LiveNodeRepository],
})
export class NodeStorageModule {}
