import { Module } from '@nestjs/common';
import { LiveRepository } from './live.repository.js';
import { LiveHistoryRepository } from './live.history.repository.js';
import { InfraModule } from '../../infra/infra.module.js';

@Module({
  imports: [InfraModule],
  providers: [LiveRepository, LiveHistoryRepository],
  exports: [LiveRepository, LiveHistoryRepository],
})
export class LiveStorageModule {}
