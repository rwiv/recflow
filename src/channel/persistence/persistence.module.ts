import { Module } from '@nestjs/common';
import { TagRepository } from './tag.repository.js';
import { ChannelRepository } from './channel.repository.js';

@Module({
  providers: [TagRepository, ChannelRepository],
  exports: [TagRepository, ChannelRepository],
})
export class ChannelPersistenceModule {}
