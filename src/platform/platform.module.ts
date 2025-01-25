import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';

@Module({
  imports: [ConfigModule],
  providers: [],
  exports: [],
})
export class PlatformModule {}
