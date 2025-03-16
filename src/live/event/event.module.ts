import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config/config.module.js';
import { Dispatcher } from './dispatcher.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [ConfigModule, InfraModule],
  providers: [Dispatcher],
  exports: [Dispatcher],
})
export class LiveEventModule {}
