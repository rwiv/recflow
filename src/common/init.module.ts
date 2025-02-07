import { Module } from '@nestjs/common';
import { AppInitializer } from './initializer.js';
import { ChannelPersistenceModule } from '../channel/persistence/persistence.module.js';
import { ChannelBusinessModule } from '../channel/business/business.module.js';

@Module({
  imports: [ChannelPersistenceModule, ChannelBusinessModule],
  providers: [AppInitializer],
  exports: [AppInitializer],
})
export class InitModule {}
