import { Module } from '@nestjs/common';
import { TagRepository } from './tag.repository.js';
import { ChannelRepository } from './channel.repository.js';
import { ChannelQueryRepository } from './channel.repository.query.js';

@Module({
  providers: [TagRepository, ChannelRepository, ChannelQueryRepository],
  exports: [TagRepository, ChannelRepository, ChannelQueryRepository],
})
export class ChannelPersistenceModule {}
