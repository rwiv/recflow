import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { StorageFactory } from './storage.factory.js';

export const TARGETED_LIVE_MAP = 'TargetLiveMap';
export const DELETED_LIVE_MAP = 'DeletedLiveMap';
export const WEBHOOK_STATE_MAP = 'WebhookStateMap';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageFactory,
    {
      provide: TARGETED_LIVE_MAP,
      useFactory: (factory: StorageFactory) => factory.targetedLiveMap(),
      inject: [StorageFactory],
    },
    {
      provide: DELETED_LIVE_MAP,
      useFactory: (factory: StorageFactory) => factory.deletedLiveMap(),
      inject: [StorageFactory],
    },
    {
      provide: WEBHOOK_STATE_MAP,
      useFactory: (factory: StorageFactory) => factory.webhookMap(),
      inject: [StorageFactory],
    },
  ],
  exports: [TARGETED_LIVE_MAP, DELETED_LIVE_MAP, WEBHOOK_STATE_MAP],
})
export class StorageModule {}
