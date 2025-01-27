import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { PlatformFetcher } from './fetcher.js';
import { ChzzkFetcher } from './chzzk.fetcher.js';
import { SoopFetcher } from './soop.fetcher.js';

@Module({
  imports: [ConfigModule],
  providers: [PlatformFetcher, ChzzkFetcher, SoopFetcher],
  exports: [PlatformFetcher],
})
export class PlatformModule {}
