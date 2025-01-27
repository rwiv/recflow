import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookStateRepository } from './repositories/webhook-state.repository.js';
import { TrackedLiveRepository } from './repositories/tracked-live-repository.service.js';
import { StorageModule } from './storage.module.js';

@Module({
  imports: [ConfigModule, StorageModule],
  providers: [WebhookStateRepository, TrackedLiveRepository],
  exports: [WebhookStateRepository, TrackedLiveRepository],
})
export class RepositoryModule {}
