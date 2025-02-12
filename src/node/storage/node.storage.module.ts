import { Module } from '@nestjs/common';
import { NodeRepository } from './node.repository.js';
import { NodeTypeRepository } from './node-type.repository.js';
import { NodeGroupRepository } from './node-group.repository.js';
import { NodeStateRepository } from './node-state.repository.js';

@Module({
  imports: [],
  providers: [NodeRepository, NodeTypeRepository, NodeGroupRepository, NodeStateRepository],
  exports: [NodeRepository, NodeTypeRepository, NodeGroupRepository, NodeStateRepository],
})
export class NodeStorageModule {}
