import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { PersistenceFactory } from './persistence.factory.js';

export const TRACKED_LIVE_MAP = 'TrackedLiveMap';
export const WEBHOOK_MAP = 'WebhookMap';

@Module({
  imports: [ConfigModule],
  providers: [
    PersistenceFactory,
    {
      provide: TRACKED_LIVE_MAP,
      useFactory: (factory: PersistenceFactory) => factory.trackedLiveMap(),
      inject: [PersistenceFactory],
    },
    {
      provide: WEBHOOK_MAP,
      useFactory: (factory: PersistenceFactory) => factory.webhookMap(),
      inject: [PersistenceFactory],
    },
  ],
  exports: [TRACKED_LIVE_MAP, WEBHOOK_MAP],
})
export class LivePersistenceModule {}
