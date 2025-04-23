import { Module } from '@nestjs/common';
import { NodeWriter } from './node.writer.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodeStorageModule } from '../storage/node.storage.module.js';
import { NodeFinder } from './node.finder.js';
import { NodeMapper } from './node.mapper.js';
import { NodeUpdater } from './node.updater.js';
import { NodeSelector } from './node.selector.js';
import { LiveStorageModule } from '../../live/storage/live.storage.module.js';
import { NodeGroupService } from './node-group.service.js';
import { NodeManager } from './node.manager.js';
import { InfraModule } from '../../infra/infra.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';

@Module({
  imports: [NodeStorageModule, LiveStorageModule, PlatformModule, InfraModule, ChannelServiceModule],
  providers: [NodeMapper, NodeWriter, NodeUpdater, NodeFinder, NodeSelector, NodeGroupService, NodeManager],
  exports: [NodeWriter, NodeUpdater, NodeFinder, NodeSelector, NodeGroupService, NodeManager],
})
export class NodeServiceModule {}
