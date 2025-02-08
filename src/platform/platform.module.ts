import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { PlatformFetcher } from './fetcher/fetcher.js';
import { ChzzkFetcher } from './fetcher/chzzk.fetcher.js';
import { SoopFetcher } from './fetcher/soop.fetcher.js';
import { PlatformRepository } from './persistence/platform.repository.js';

@Module({
  imports: [ConfigModule],
  providers: [PlatformFetcher, ChzzkFetcher, SoopFetcher, PlatformRepository],
  exports: [PlatformFetcher, PlatformRepository],
})
export class PlatformModule {}
