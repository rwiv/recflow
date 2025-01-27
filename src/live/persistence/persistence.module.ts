import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { PersistenceFactory } from './persistence.factory.js';

export const LIVE_MAP = 'LiveMap';
export const WEBHOOK_MAP = 'WebhookMap';

@Module({
  imports: [ConfigModule],
  providers: [
    PersistenceFactory,
    {
      provide: LIVE_MAP,
      useFactory: (factory: PersistenceFactory) => factory.liveMap(),
      inject: [PersistenceFactory],
    },
    {
      provide: WEBHOOK_MAP,
      useFactory: (factory: PersistenceFactory) => factory.webhookMap(),
      inject: [PersistenceFactory],
    },
  ],
  exports: [LIVE_MAP, WEBHOOK_MAP],
})
export class LivePersistenceModule {}
