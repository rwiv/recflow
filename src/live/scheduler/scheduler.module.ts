import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveAccessModule } from '../access/live.access.module.js';
import { LiveScheduler } from './scheduler.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { ScheduleErrorHandler } from './error.handler.js';
import { NodeStorageModule } from '../../node/storage/node.storage.module.js';
import { LiveRegistryModule } from '../registry/live.registry.module.js';

@Module({
  imports: [
    ConfigModule,
    LiveAccessModule,
    LiveRegistryModule,
    PlatformModule,
    ChannelServiceModule,
    NodeStorageModule,
  ],
  providers: [LiveScheduler, ChzzkLiveFilter, SoopLiveFilter, ScheduleErrorHandler],
  exports: [LiveScheduler],
})
export class LiveSchedulerModule {}
