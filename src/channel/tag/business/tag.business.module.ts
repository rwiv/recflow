import { Module } from '@nestjs/common';
import { TagWriter } from './tag.writer.js';
import { TagFinder } from './tag.finder.js';
import { ChannelPersistenceModule } from '../../channel/persistence/channel.persistence.module.js';
import { ChannelTagPersistenceModule } from '../persistence/tag.persistence.module.js';

@Module({
  imports: [ChannelTagPersistenceModule, ChannelPersistenceModule],
  providers: [TagWriter, TagFinder],
  exports: [TagWriter, TagFinder],
})
export class ChannelTagBusinessModule {}
