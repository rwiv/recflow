import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { StorageFactory } from './storage.factory.js';

export const TARGET_MAP = 'TargetMap';
export const WEBHOOK_MAP = 'WebhookMap';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageFactory,
    {
      provide: TARGET_MAP,
      useFactory: (factory: StorageFactory) => factory.targetMap(),
      inject: [StorageFactory],
    },
    {
      provide: WEBHOOK_MAP,
      useFactory: (factory: StorageFactory) => factory.webhookMap(),
      inject: [StorageFactory],
    },
  ],
  exports: [TARGET_MAP, WEBHOOK_MAP],
})
export class StorageModule {}
