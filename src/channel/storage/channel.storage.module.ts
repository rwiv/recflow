import { Module } from '@nestjs/common';
import { ChannelCommandRepository } from './channel.command.js';
import { ChannelQueryRepository } from './channel.query.js';
import { ChannelSearchRepository } from './channel.search.js';
import { ChannelPriorityRepository } from './priority.repository.js';
import { TagCommandRepository } from './tag.command.js';
import { TagQueryRepository } from './tag.query.js';

@Module({
  imports: [],
  providers: [
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    ChannelPriorityRepository,
    TagCommandRepository,
    TagQueryRepository,
  ],
  exports: [
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    ChannelPriorityRepository,
    TagCommandRepository,
    TagQueryRepository,
  ],
})
export class ChannelStorageModule {}
