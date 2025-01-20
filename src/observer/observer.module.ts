import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookModule } from '../webhook/webhook.module.js';
import { CheckerChzzk } from './checker.chzzk.js';
import { ClientModule } from '../client/client.module.js';
import { StorageModule } from '../storage/stroage.module.js';
import { CheckerSoop } from './checker.soop.js';
import { Observer } from './Observer.js';
import { LiveFilterChzzk } from './filters/live-filter.chzzk.js';
import { LiveFilterSoop } from './filters/live-filter.soop.js';
import { Allocator } from './allocator.js';

@Module({
  imports: [ConfigModule, ClientModule, StorageModule, WebhookModule],
  providers: [
    Observer,
    CheckerChzzk,
    CheckerSoop,
    Allocator,
    LiveFilterChzzk,
    LiveFilterSoop,
  ],
  exports: [
    Observer,
    CheckerChzzk,
    CheckerSoop,
    Allocator,
    LiveFilterChzzk,
    LiveFilterSoop,
  ],
})
export class ObserverModule {}
