import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { PersistenceFactory } from './persistence.factory.js';

export const LIVE_MAP = 'LiveMap';
export const NODE_MAP = 'NodeMap';

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
      provide: NODE_MAP,
      useFactory: (factory: PersistenceFactory) => factory.nodeMap(),
      inject: [PersistenceFactory],
    },
  ],
  exports: [LIVE_MAP, NODE_MAP],
})
export class LivePersistenceModule {}
