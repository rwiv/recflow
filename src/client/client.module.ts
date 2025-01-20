import { Module } from '@nestjs/common';
import { Streamq } from './streamq.js';
import { ConfigModule } from '../common/common.module.js';

@Module({
  imports: [ConfigModule],
  providers: [Streamq],
  exports: [Streamq],
})
export class ClientModule {}
