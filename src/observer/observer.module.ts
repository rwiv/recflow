import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { AllocatorChzzk } from './allocator.chzzk.js';
import { WebhookModule } from '../webhook/webhook.module.js';
import { CheckerChzzk } from './checker.chzzk.js';
import { ClientModule } from '../client/client.module.js';
import { StorageModule } from '../repository/stroage.module.js';
import { AllocatorSoop } from './allocator.soop.js';
import { CheckerSoop } from './checker.soop.js';
import { Observer } from './Observer.js';
import { LiveFilterChzzk } from './live-filter.chzzk.js';
import { LiveFilterSoop } from './live-filter.soop.js';

@Module({
  imports: [ConfigModule, ClientModule, StorageModule, WebhookModule],
  providers: [
    Observer,
    CheckerChzzk,
    CheckerSoop,
    AllocatorChzzk,
    AllocatorSoop,
    LiveFilterChzzk,
    LiveFilterSoop,
  ],
  exports: [
    Observer,
    CheckerChzzk,
    CheckerSoop,
    AllocatorChzzk,
    AllocatorSoop,
    LiveFilterChzzk,
    LiveFilterSoop,
  ],
})
export class ObserverModule {}
