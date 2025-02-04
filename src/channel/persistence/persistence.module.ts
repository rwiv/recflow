import { Module } from '@nestjs/common';
import { TagCommandRepository } from './tag.command.repository.js';
import { ChannelCommandRepository } from './channel.command.repository.js';
import { ChannelQueryRepository } from './channel.query.repository.js';
import { TagQueryRepository } from './tag.query.repository.js';

@Module({
  providers: [
    TagCommandRepository,
    TagQueryRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
  ],
  exports: [
    TagCommandRepository,
    TagQueryRepository,
    ChannelCommandRepository,
    ChannelQueryRepository,
  ],
})
export class ChannelPersistenceModule {}
