import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookModule } from '../webhook/webhook.module.js';
import { ClientModule } from '../client/client.module.js';
import { RepositoryModule } from '../storage/repository.module.js';
import { Observer } from './observer.js';
import { ChzzkLiveFilter } from './filters/live-filter.chzzk.js';
import { SoopLiveFilter } from './filters/live-filter.soop.js';
import { Allocator } from './allocator.js';
import { Dispatcher } from './dispatcher.js';
import { PlatformModule } from '../platform/platform.module.js';

@Module({
  imports: [ConfigModule, ClientModule, RepositoryModule, WebhookModule, PlatformModule],
  providers: [Observer, Allocator, ChzzkLiveFilter, SoopLiveFilter, Dispatcher],
  exports: [Observer, Allocator, ChzzkLiveFilter, SoopLiveFilter, Dispatcher],
})
export class ObserverModule {}
