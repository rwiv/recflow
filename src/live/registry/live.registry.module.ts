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
import { LiveRecoveryManager } from './live.recovery.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { LiveCleaner } from './live.cleaner.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveFinalizer } from './live.finalizer.js';
import { LiveRebalancer } from './live.rebalancer.js';
import { LiveAllocator } from './live.allocator.js';
import { LiveStorageModule } from '../storage/live.storage.module.js';
import { CriterionServiceModule } from '../../criterion/service/criterion.service.module.js';

@Module({
  imports: [
    ConfigModule,
    InfraModule,
    LiveStorageModule,
    LiveDataModule,
    ChannelServiceModule,
    NodeStorageModule,
    NodeServiceModule,
    PlatformModule,
    CriterionServiceModule,
  ],
  providers: [
    LiveRegistrar,
    LiveCoordinator,
    LiveCleaner,
    PlatformLiveFilter,
    ChzzkLiveFilter,
    SoopLiveFilter,
    LiveRecoveryManager,
    LiveFinalizer,
    LiveRebalancer,
    LiveAllocator,
  ],
  exports: [
    LiveRegistrar,
    LiveCoordinator,
    LiveCleaner,
    LiveRecoveryManager,
    LiveRebalancer,
    LiveFinalizer,
    LiveAllocator,
  ],
})
export class LiveRegistryModule {}
