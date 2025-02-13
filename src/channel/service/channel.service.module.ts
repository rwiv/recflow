import { Module } from '@nestjs/common';
import { ChannelStorageModule } from '../storage/channel.storage.module.js';
import { ChannelWriter } from './channel.writer.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelFinder } from './channel.finder.js';
import { ChannelUpdater } from './channel.updater.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelSearcher } from './channel.searcher.js';
import { TagWriter } from './tag.writer.js';
import { TagFinder } from './tag.finder.js';
import { PriorityWriter } from './priority.writer.js';

@Module({
  imports: [ChannelStorageModule, PlatformModule],
  providers: [
    TagWriter,
    TagFinder,
    ChannelWriter,
    ChannelFinder,
    ChannelSearcher,
    ChannelUpdater,
    ChannelMapper,
    PriorityWriter,
  ],
  exports: [
    TagWriter,
    TagFinder,
    ChannelWriter,
    ChannelFinder,
    ChannelSearcher,
    ChannelUpdater,
    PriorityWriter,
  ],
})
export class ChannelServiceModule {}
