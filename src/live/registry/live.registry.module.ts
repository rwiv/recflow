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
import { LiveCoordinator } from './live.coordinator.js';
import { LiveRecoveryManager } from './live.recovery.manager.js';
import { InfraModule } from '../../infra/infra.module.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';

@Module({
  imports: [
    ConfigModule,
    LiveAccessModule,
    ChannelServiceModule,
    NodeStorageModule,
    NodeServiceModule,
    PlatformModule,
    LiveEventModule,
    InfraModule,
  ],
  providers: [
    LiveRegistrar,
    LiveCoordinator,
    PlatformLiveFilter,
    ChzzkLiveFilter,
    SoopLiveFilter,
    LiveRecoveryManager,
  ],
  exports: [LiveRegistrar, LiveCoordinator, LiveRecoveryManager],
})
export class LiveRegistryModule {}
