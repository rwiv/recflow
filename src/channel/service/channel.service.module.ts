import { Module } from '@nestjs/common';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelCacheChecker } from '@/channel/service/channel.cache.checker.js';
import { ChannelFinder } from '@/channel/service/channel.finder.js';
import { ChannelMapper } from '@/channel/service/channel.mapper.js';
import { ChannelSearcher } from '@/channel/service/channel.searcher.js';
import { ChannelWriter } from '@/channel/service/channel.writer.js';
import { GradeService } from '@/channel/service/grade.service.js';
import { TagFinder } from '@/channel/service/tag.finder.js';
import { TagWriter } from '@/channel/service/tag.writer.js';
import { ChannelStorageModule } from '@/channel/storage/channel.storage.module.js';

import { LiveStorageModule } from '@/live/storage/live.storage.module.js';

@Module({
  imports: [PlatformModule, ChannelStorageModule, LiveStorageModule],
  providers: [
    GradeService,
    TagWriter,
    TagFinder,
    ChannelWriter,
    ChannelFinder,
    ChannelSearcher,
    ChannelMapper,
    ChannelCacheChecker,
  ],
  exports: [
    GradeService,
    TagWriter,
    TagFinder,
    ChannelWriter,
    ChannelFinder,
    ChannelMapper,
    ChannelSearcher,
    ChannelCacheChecker,
  ],
})
export class ChannelServiceModule {}
