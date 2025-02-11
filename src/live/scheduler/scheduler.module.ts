import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveBusinessModule } from '../business/live.business.module.js';
import { LiveScheduler } from './scheduler.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { ScheduleErrorHandler } from './error.handler.js';
import { NodePersistenceModule } from '../../node/persistence/node.persistence.module.js';

@Module({
  imports: [ConfigModule, LiveBusinessModule, PlatformModule, ChannelBusinessModule, NodePersistenceModule],
  providers: [LiveScheduler, ChzzkLiveFilter, SoopLiveFilter, ScheduleErrorHandler],
  exports: [LiveScheduler],
})
export class LiveSchedulerModule {}
