import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { StorageFactory } from './storage.factory.js';

export const TRACKED_LIVE_MAP = 'TrackedLiveMap';
export const DELETED_LIVE_MAP = 'DeletedLiveMap';
export const WEBHOOK_MAP = 'WebhookMap';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageFactory,
    {
      provide: TRACKED_LIVE_MAP,
      useFactory: (factory: StorageFactory) => factory.trackedLiveMap(),
      inject: [StorageFactory],
    },
    {
      provide: DELETED_LIVE_MAP,
      useFactory: (factory: StorageFactory) => factory.deletedLiveMap(),
      inject: [StorageFactory],
    },
    {
      provide: WEBHOOK_MAP,
      useFactory: (factory: StorageFactory) => factory.webhookMap(),
      inject: [StorageFactory],
    },
  ],
  exports: [TRACKED_LIVE_MAP, DELETED_LIVE_MAP, WEBHOOK_MAP],
})
export class StorageModule {}
