import { Module } from '@nestjs/common';
import { NodeWriter } from './node.writer.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodePersistenceModule } from '../persistence/node.persistence.module.js';
import { NodeFinder } from './node.finder.js';
import { NodeMapper } from './node.mapper.js';
import { NodeUpdater } from './node.updater.js';
import { NodeSelector } from './node.selector.js';
import { ChannelPriorityModule } from '../../channel/priority/priority.module.js';

@Module({
  imports: [NodePersistenceModule, PlatformModule, ChannelPriorityModule],
  providers: [NodeMapper, NodeWriter, NodeUpdater, NodeFinder, NodeSelector],
  exports: [NodeWriter, NodeUpdater, NodeFinder, NodeSelector],
})
export class NodeBusinessModule {}
