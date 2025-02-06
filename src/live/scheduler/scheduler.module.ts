import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { LiveBusinessModule } from '../business/business.module.js';
import { LiveScheduler } from './scheduler.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelBusinessModule } from '../../channel/business/business.module.js';

@Module({
  imports: [ConfigModule, LiveBusinessModule, PlatformModule, ChannelBusinessModule],
  providers: [LiveScheduler, ChzzkLiveFilter, SoopLiveFilter],
  exports: [LiveScheduler],
})
export class LiveSchedulerModule {}
