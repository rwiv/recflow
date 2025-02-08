import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { LiveEventListener } from './listener.js';
import { Dispatcher } from './dispatcher.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [ConfigModule, InfraModule],
  providers: [LiveEventListener, Dispatcher],
  exports: [LiveEventListener],
})
export class LiveEventModule {}
