import { Module } from '@nestjs/common';
import { ChannelCommandRepository } from './channel.command.js';
import { ChannelQueryRepository } from './channel.query.js';
import { ChannelSearchRepository } from './channel.search.js';
import { ChannelPriorityRepository } from '../../priority/priority.repository.js';
import { ChannelTagPersistenceModule } from '../../tag/persistence/persistence.module.js';

@Module({
  imports: [ChannelTagPersistenceModule],
  providers: [
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    ChannelPriorityRepository,
  ],
  exports: [
    ChannelCommandRepository,
    ChannelQueryRepository,
    ChannelSearchRepository,
    ChannelPriorityRepository,
  ],
})
export class ChannelPersistenceModule {}
