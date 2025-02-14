import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { PlatformFetcher } from './fetcher/fetcher.js';
import { ChzzkFetcher } from './fetcher/fetcher.chzzk.js';
import { SoopFetcher } from './fetcher/fetcher.soop.js';
import { PlatformRepository } from './storage/platform.repository.js';
import { PlatformFinder } from './storage/platform.finder.js';
import { PlatformController } from './storage/platform.controller.js';

@Module({
  imports: [ConfigModule],
  controllers: [PlatformController],
  providers: [PlatformFetcher, ChzzkFetcher, SoopFetcher, PlatformRepository, PlatformFinder],
  exports: [PlatformFetcher, PlatformRepository, PlatformFinder],
})
export class PlatformModule {}
