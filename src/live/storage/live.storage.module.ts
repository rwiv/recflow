import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/infra.module.js';

import { LiveStreamRepository } from '@/live/storage/live-stream.repository.js';
import { LiveHistoryRepository } from '@/live/storage/live.history.repository.js';
import { LiveRepository } from '@/live/storage/live.repository.js';

@Module({
  imports: [InfraModule],
  providers: [LiveRepository, LiveHistoryRepository, LiveStreamRepository],
  exports: [LiveRepository, LiveHistoryRepository, LiveStreamRepository],
})
export class LiveStorageModule {}
