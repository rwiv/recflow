import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';
import { LiveHistoryRepository } from './live.history.repository.js';
import { InfraModule } from '../../infra/infra.module.js';
import { LiveStreamRepository } from './live-stream.repository.js';

@Module({
  imports: [InfraModule],
  providers: [LiveRepository, LiveHistoryRepository, LiveStreamRepository],
  exports: [LiveRepository, LiveHistoryRepository, LiveStreamRepository],
})
export class LiveStorageModule {}
