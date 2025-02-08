import { Module } from '@nestjs/common';
import { ChannelPersistenceModule } from '../persistence/persistence.module.js';
import { ChannelWriter } from './channel.writer.js';
import { PlatformModule } from '../../../platform/platform.module.js';
import { ChannelFinder } from './channel.finder.js';
import { ChannelUpdater } from './channel.updater.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelSearcher } from './channel.searcher.js';
import { ChannelTagBusinessModule } from '../../tag/business/business.module.js';
import { ChannelTagPersistenceModule } from '../../tag/persistence/persistence.module.js';

@Module({
  imports: [
    ChannelTagPersistenceModule,
    ChannelTagBusinessModule,
    ChannelPersistenceModule,
    PlatformModule,
  ],
  providers: [ChannelWriter, ChannelFinder, ChannelSearcher, ChannelUpdater, ChannelMapper],
  exports: [ChannelWriter, ChannelFinder, ChannelSearcher, ChannelUpdater],
})
export class ChannelBusinessModule {}
