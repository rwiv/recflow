import { Module } from '@nestjs/common';
import { NodeRepository } from './node.repository.js';
import { NodeTypeRepository } from './node-type.repository.js';
import { NodeGroupRepository } from './node-group.repository.js';
import { NodeStateRepository } from './node-state.repository.js';
import { LiveNodeRepository } from './live-node.repository.js';

@Module({
  imports: [],
  providers: [
    NodeRepository,
    NodeTypeRepository,
    NodeGroupRepository,
    NodeStateRepository,
    LiveNodeRepository,
  ],
  exports: [NodeRepository, NodeTypeRepository, NodeGroupRepository, NodeStateRepository, LiveNodeRepository],
})
export class NodeStorageModule {}
