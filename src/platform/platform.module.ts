import { Module } from '@nestjs/common';

import { ConfigModule } from '@/common/config/config.module.js';

import { InfraModule } from '@/infra/infra.module.js';

import { PlatformFetcherImpl } from '@/platform/fetcher/fetcher.impl.js';
import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';
import { ChzzkFetcher } from '@/platform/fetcher/platforms/fetcher.chzzk.js';
import { SoopFetcher } from '@/platform/fetcher/platforms/fetcher.soop.js';
import { Stlink } from '@/platform/stlink/stlink.js';
import { PlatformCacheStore } from '@/platform/storage/platform.cache.store.js';
import { PlatformController } from '@/platform/storage/platform.controller.js';
import { PlatformFinder } from '@/platform/storage/platform.finder.js';
import { PlatformRepository } from '@/platform/storage/platform.repository.js';
import { PlatformWriter } from '@/platform/storage/platform.writer.js';

@Module({
  imports: [ConfigModule, InfraModule],
  controllers: [PlatformController],
  providers: [
    ChzzkFetcher,
    SoopFetcher,
    PlatformRepository,
    PlatformFinder,
    PlatformWriter,
    PlatformCacheStore,
    Stlink,
    {
      provide: PlatformFetcher,
      useClass: PlatformFetcherImpl,
    },
  ],
  exports: [PlatformFetcher, PlatformRepository, PlatformFinder, PlatformWriter, PlatformCacheStore, Stlink],
})
export class PlatformModule {}
