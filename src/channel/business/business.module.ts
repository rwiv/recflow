import { Module } from '@nestjs/common';
import { ChannelPersistenceModule } from '../persistence/persistence.module.js';
import { TagService } from './tag.service.js';
import { ChannelCommander } from './channel.commander.js';
import { ChannelValidator } from './channel.validator.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelFinder } from './channel.finder.js';

@Module({
  imports: [ChannelPersistenceModule, PlatformModule],
  providers: [TagService, ChannelCommander, ChannelFinder, ChannelValidator],
  exports: [TagService, ChannelCommander, ChannelFinder],
})
export class ChannelBusinessModule {}
