import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { StorageFactory } from './storage.factory.js';

export const TARGETED_LIVE_MAP = 'TargetMap';
export const DELETED_LIVE_SET = 'DeletedSet';
export const WEBHOOK_MAP = 'WebhookMap';

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
      provide: DELETED_LIVE_SET,
      useFactory: (factory: StorageFactory) => factory.deletedLiveSet(),
      inject: [StorageFactory],
    },
    {
      provide: WEBHOOK_MAP,
      useFactory: (factory: StorageFactory) => factory.webhookMap(),
      inject: [StorageFactory],
    },
  ],
  exports: [TARGETED_LIVE_MAP, WEBHOOK_MAP],
})
export class StorageModule {}
