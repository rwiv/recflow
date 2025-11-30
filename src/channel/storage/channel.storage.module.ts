import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/infra.module.js';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelCacheStore } from '@/channel/storage/channel.cache.store.js';
import { ChannelCommandRepository } from '@/channel/storage/channel.command.js';
import { ChannelQueryRepository } from '@/channel/storage/channel.query.js';
import { ChannelSearchRepository } from '@/channel/storage/channel.search.js';
import { GradeRepository } from '@/channel/storage/grade.repository.js';
import { TagCommandRepository } from '@/channel/storage/tag.command.js';
import { TagQueryRepository } from '@/channel/storage/tag.query.js';

@Module({
  imports: [InfraModule, PlatformModule],
  providers: [
    GradeRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    TagCommandRepository,
    TagQueryRepository,
    ChannelCacheStore,
  ],
  exports: [
    GradeRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    TagCommandRepository,
    TagQueryRepository,
    ChannelCacheStore,
  ],
})
export class ChannelStorageModule {}
