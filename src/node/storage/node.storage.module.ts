import { Module } from '@nestjs/common';
import { NodeRepository } from './node.repository.js';
import { NodeTypeRepository } from './node-type.repository.js';
import { NodeGroupRepository } from './node-group.repository.js';
import { LiveNodeRepository } from './live-node.repository.js';

@Module({
  imports: [],
  providers: [NodeRepository, NodeTypeRepository, NodeGroupRepository, LiveNodeRepository],
  exports: [NodeRepository, NodeTypeRepository, NodeGroupRepository, LiveNodeRepository],
})
export class NodeStorageModule {}
