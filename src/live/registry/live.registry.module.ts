import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { NodeServiceModule } from '../../node/service/node.service.module.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveDataModule } from '../data/live.data.module.js';
import { PlatformLiveFilter } from './live.filter.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveCoordinator } from './live.coordinator.js';
import { LiveRecoveryManager } from './live.recovery-manager.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { LiveCleaner } from './live.cleaner.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveDispatcher } from './live.dispatcher.js';

@Module({
  imports: [
    ConfigModule,
    InfraModule,
    LiveDataModule,
    ChannelServiceModule,
    NodeStorageModule,
    NodeServiceModule,
    PlatformModule,
  ],
  providers: [
    LiveRegistrar,
    LiveCoordinator,
    LiveCleaner,
    PlatformLiveFilter,
    ChzzkLiveFilter,
    SoopLiveFilter,
    LiveRecoveryManager,
    LiveDispatcher,
  ],
  exports: [LiveRegistrar, LiveCoordinator, LiveCleaner, LiveRecoveryManager],
})
export class LiveRegistryModule {}
