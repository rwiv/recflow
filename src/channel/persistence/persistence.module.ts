import { Module } from '@nestjs/common';
import { TagCommandRepository } from './tag.command.js';
import { ChannelCommandRepository } from './channel.command.js';
import { ChannelQueryRepository } from './channel.query.js';
import { TagQueryRepository } from './tag.query.js';
import { ChannelSearchRepository } from './channel.search.js';

@Module({
  providers: [
    TagCommandRepository,
    TagQueryRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
  ],
  exports: [
    TagCommandRepository,
    TagQueryRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
  ],
})
export class ChannelPersistenceModule {}
