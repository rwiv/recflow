import { Module } from '@nestjs/common';
import { ChannelStorageModule } from '../storage/channel.storage.module.js';
import { ChannelWriter } from './channel.writer.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelFinder } from './channel.finder.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelSearcher } from './channel.searcher.js';
import { TagWriter } from './tag.writer.js';
import { TagFinder } from './tag.finder.js';
import { PriorityService } from './priority.service.js';

@Module({
  imports: [ChannelStorageModule, PlatformModule],
  providers: [
    TagWriter,
    TagFinder,
    ChannelWriter,
    ChannelFinder,
    ChannelSearcher,
    ChannelMapper,
    PriorityService,
  ],
  exports: [TagWriter, TagFinder, ChannelWriter, ChannelFinder, ChannelSearcher, PriorityService],
})
export class ChannelServiceModule {}
