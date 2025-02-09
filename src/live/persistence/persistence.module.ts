import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { PersistenceFactory } from './persistence.factory.js';
import { LiveRepository } from './live.repository.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { NodeBusinessModule } from '../../node/business/node.business.module.js';

export const LIVE_MAP = 'LiveMap';

@Module({
  imports: [ConfigModule, ChannelBusinessModule, NodeBusinessModule],
  providers: [
    LiveRepository,
    PersistenceFactory,
    {
      provide: LIVE_MAP,
      useFactory: (factory: PersistenceFactory) => factory.liveMap(),
      inject: [PersistenceFactory],
    },
  ],
  exports: [LiveRepository, LIVE_MAP],
})
export class LivePersistenceModule {}
