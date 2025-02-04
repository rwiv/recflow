import { Module } from '@nestjs/common';
import { TagCommandRepository } from './tag.command.repository.js';
import { ChannelCommandRepository } from './channel.command.repository.js';
import { ChannelQueryRepository } from './channel.query.repository.js';

@Module({
  providers: [TagCommandRepository, ChannelCommandRepository, ChannelQueryRepository],
  exports: [TagCommandRepository, ChannelCommandRepository, ChannelQueryRepository],
})
export class ChannelPersistenceModule {}
