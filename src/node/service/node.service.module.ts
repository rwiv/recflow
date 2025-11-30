import { Module } from '@nestjs/common';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';

import { NodeGroupService } from '@/node/service/node-group.service.js';
import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeMapper } from '@/node/service/node.mapper.js';
import { NodeSelector } from '@/node/service/node.selector.js';
import { NodeWriter } from '@/node/service/node.writer.js';
import { NodeStorageModule } from '@/node/storage/node.storage.module.js';

import { LiveStorageModule } from '@/live/storage/live.storage.module.js';

@Module({
  imports: [NodeStorageModule, LiveStorageModule, PlatformModule, ChannelServiceModule],
  providers: [NodeMapper, NodeWriter, NodeFinder, NodeSelector, NodeGroupService],
  exports: [NodeWriter, NodeFinder, NodeSelector, NodeGroupService],
})
export class NodeServiceModule {}
