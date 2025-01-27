import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config.module.js';
import { PlatformFetcher } from './fetcher/fetcher.js';
import { ChzzkFetcher } from './fetcher/chzzk.fetcher.js';
import { SoopFetcher } from './fetcher/soop.fetcher.js';

@Module({
  imports: [ConfigModule],
  providers: [PlatformFetcher, ChzzkFetcher, SoopFetcher],
  exports: [PlatformFetcher],
})
export class PlatformModule {}
