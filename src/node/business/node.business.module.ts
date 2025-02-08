import { Module } from '@nestjs/common';
import { NodeWriter } from './node.writer.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodePersistenceModule } from '../persistence/node.persistence.module.js';
import { NodeFinder } from './node.finder.js';
import { NodeMapper } from './node.mapper.js';

@Module({
  imports: [NodePersistenceModule, PlatformModule],
  providers: [NodeMapper, NodeWriter, NodeFinder],
  exports: [NodeWriter, NodeFinder],
})
export class NodeBusinessModule {}
