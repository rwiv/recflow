import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { LiveServiceModule } from '../service/service.module.js';
import { LiveScheduler } from './scheduler.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { PlatformModule } from '../../platform/platform.module.js';

@Module({
  imports: [ConfigModule, LiveServiceModule, PlatformModule],
  providers: [LiveScheduler, ChzzkLiveFilter, SoopLiveFilter],
  exports: [LiveScheduler],
})
export class LiveSyncModule {}
