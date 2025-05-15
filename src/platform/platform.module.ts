import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module.js';
import { PlatformFetcher } from './fetcher/fetcher.js';
import { ChzzkFetcher } from './fetcher/fetcher.chzzk.js';
import { SoopFetcher } from './fetcher/fetcher.soop.js';
import { PlatformRepository } from './storage/platform.repository.js';
import { PlatformFinder } from './storage/platform.finder.js';
import { PlatformController } from './storage/platform.controller.js';
import { Stlink } from './stlink/stlink.js';
import { PlatformWriter } from './storage/platform.writer.js';
import { PlatformCacheStore } from './storage/platform.cache.store.js';
import { InfraModule } from '../infra/infra.module.js';

@Module({
  imports: [ConfigModule, InfraModule],
  controllers: [PlatformController],
  providers: [
    PlatformFetcher,
    ChzzkFetcher,
    SoopFetcher,
    PlatformRepository,
    PlatformFinder,
    PlatformWriter,
    PlatformCacheStore,
    Stlink,
  ],
  exports: [PlatformFetcher, PlatformRepository, PlatformFinder, PlatformWriter, PlatformCacheStore, Stlink],
})
export class PlatformModule {}
