import { Module } from '@nestjs/common';
import { ChannelCommandRepository } from './channel.command.js';
import { ChannelQueryRepository } from './channel.query.js';
import { ChannelSearchRepository } from './channel.search.js';
import { PriorityRepository } from './priority.repository.js';
import { TagCommandRepository } from './tag.command.js';
import { TagQueryRepository } from './tag.query.js';

@Module({
  imports: [],
  providers: [
    PriorityRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    TagCommandRepository,
    TagQueryRepository,
  ],
  exports: [
    PriorityRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    TagCommandRepository,
    TagQueryRepository,
  ],
})
export class ChannelStorageModule {}
