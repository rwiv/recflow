import { Module } from '@nestjs/common';
import { NodeRepository } from './node.repository.js';
import { NodeGroupRepository } from './node-group.repository.js';
import { LiveNodeRepository } from './live-node.repository.js';

@Module({
  imports: [],
  providers: [NodeRepository, NodeGroupRepository, LiveNodeRepository],
  exports: [NodeRepository, NodeGroupRepository, LiveNodeRepository],
})
export class NodeStorageModule {}
