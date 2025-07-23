import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelServiceModule } from '../../channel/service/channel.service.module.js';
import { LiveDataModule } from '../data/live.data.module.js';
import { PlatformLiveFilter } from './live.filter.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { LiveDetector } from './live.detector.js';
import { LiveRegisterModule } from '../register/live.register.module.js';
import { LiveStorageModule } from '../storage/live.storage.module.js';

@Module({
  imports: [LiveDataModule, LiveStorageModule, ChannelServiceModule, PlatformModule, LiveRegisterModule],
  providers: [LiveDetector, PlatformLiveFilter, ChzzkLiveFilter, SoopLiveFilter],
  exports: [LiveDetector],
})
export class LiveDetectionModule {}
