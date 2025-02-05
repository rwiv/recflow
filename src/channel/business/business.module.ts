import { Module } from '@nestjs/common';
import { ChannelPersistenceModule } from '../persistence/persistence.module.js';
import { TagWriter } from './tag.writer.js';
import { ChannelWriter } from './channel.writer.js';
import { ChannelValidator } from './channel.validator.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelFinder } from './channel.finder.js';
import { TagFinder } from './tag.finder.js';
import { ChannelUpdater } from './channel.updater.js';

@Module({
  imports: [ChannelPersistenceModule, PlatformModule],
  providers: [TagWriter, TagFinder, ChannelWriter, ChannelFinder, ChannelUpdater, ChannelValidator],
  exports: [TagWriter, TagFinder, ChannelWriter, ChannelFinder, ChannelUpdater],
})
export class ChannelBusinessModule {}
