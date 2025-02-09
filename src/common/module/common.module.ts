import { Module } from '@nestjs/common';
import { AppInitializer } from './initializer.js';
import { ChannelPersistenceModule } from '../../channel/channel/persistence/channel.persistence.module.js';
import { ChannelBusinessModule } from '../../channel/channel/business/channel.business.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { NodePersistenceModule } from '../../node/persistence/node.persistence.module.js';
import { NodeBusinessModule } from '../../node/business/node.business.module.js';
import { DevInitInjector } from './dev-injector.js';

@Module({
  imports: [
    ChannelPersistenceModule,
    ChannelBusinessModule,
    PlatformModule,
    NodePersistenceModule,
    NodeBusinessModule,
  ],
  providers: [AppInitializer, DevInitInjector],
  exports: [AppInitializer],
})
export class CommonModule {}
