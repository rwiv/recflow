import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveEventModule } from '../event/event.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveAccessModule } from '../access/live.access.module.js';
import { PlatformLiveFilter } from './live.filter.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { LiveCoordinator } from './live.coordinator.js';
import { ChannelStorageModule } from '../../channel/storage/channel.storage.module.js';

@Module({
  imports: [
    ConfigModule,
    NodeStorageModule,
    LiveAccessModule,
    ChannelServiceModule,
    ChannelStorageModule,
    NodeServiceModule,
    PlatformModule,
    LiveEventModule,
  ],
  providers: [LiveRegistrar, LiveCoordinator, PlatformLiveFilter, ChzzkLiveFilter, SoopLiveFilter],
  exports: [LiveRegistrar, LiveCoordinator],
})
export class LiveRegistryModule {}
