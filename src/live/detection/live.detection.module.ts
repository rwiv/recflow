import { Module } from '@nestjs/common';

import { PlatformModule } from '@/platform/platform.module.js';

import { ChannelServiceModule } from '@/channel/service/channel.service.module.js';

import { LiveDataModule } from '@/live/data/live.data.module.js';
import { ChzzkLiveFilter } from '@/live/detection/filters/live-filter.chzzk.js';
import { SoopLiveFilter } from '@/live/detection/filters/live-filter.soop.js';
import { LiveDetector } from '@/live/detection/live.detector.js';
import { PlatformLiveFilter } from '@/live/detection/live.filter.js';
import { LiveRegisterModule } from '@/live/register/live.register.module.js';
import { LiveStorageModule } from '@/live/storage/live.storage.module.js';

@Module({
  imports: [LiveDataModule, LiveStorageModule, ChannelServiceModule, PlatformModule, LiveRegisterModule],
  providers: [LiveDetector, PlatformLiveFilter, ChzzkLiveFilter, SoopLiveFilter],
  exports: [LiveDetector],
})
export class LiveDetectionModule {}
