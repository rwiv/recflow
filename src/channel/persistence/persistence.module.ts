import { Module } from '@nestjs/common';
import { TagCommandRepository } from './tag.command.js';
import { ChannelCommandRepository } from './channel.command.js';
import { ChannelQueryRepository } from './channel.query.js';
import { TagQueryRepository } from './tag.query.js';
import { ChannelSearchRepository } from './channel.search.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';

@Module({
  providers: [
    TagCommandRepository,
    TagQueryRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    ChannelPriorityRepository,
  ],
  exports: [
    TagCommandRepository,
    TagQueryRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    ChannelPriorityRepository,
  ],
})
export class ChannelPersistenceModule {}
