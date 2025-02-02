import { Module } from '@nestjs/common';
import { ChannelPersistenceModule } from '../persistence/persistence.module.js';
import { TagService } from './tag.service.js';
import { ChannelService } from './channel.service.js';

@Module({
  imports: [ChannelPersistenceModule],
  providers: [TagService, ChannelService],
  exports: [TagService, ChannelService],
})
export class ChannelBusinessModule {}
