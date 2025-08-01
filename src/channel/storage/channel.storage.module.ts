import { Module } from '@nestjs/common';
import { ChannelCommandRepository } from './channel.command.js';
import { ChannelQueryRepository } from './channel.query.js';
import { ChannelSearchRepository } from './channel.search.js';
import { GradeRepository } from './grade.repository.js';
import { TagCommandRepository } from './tag.command.js';
import { TagQueryRepository } from './tag.query.js';
import { ChannelCacheStore } from './channel.cache.store.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [InfraModule],
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
