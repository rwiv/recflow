import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { PersistenceFactory } from './persistence.factory.js';

export const LIVE_MAP = 'LiveMap';

@Module({
  imports: [ConfigModule],
  providers: [
    PersistenceFactory,
    {
      provide: LIVE_MAP,
      useFactory: (factory: PersistenceFactory) => factory.liveMap(),
      inject: [PersistenceFactory],
    },
  ],
  exports: [LIVE_MAP],
})
export class LivePersistenceModule {}
