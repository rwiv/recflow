import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookRepository } from './repositories/webhook.repository.js';
import { TrackedLiveRepository } from './repositories/tracked-live-repository.service.js';
import { StorageModule } from './storage.module.js';
import { PlatformModule } from '../platform/platform.module.js';

@Module({
  imports: [ConfigModule, StorageModule, PlatformModule],
  providers: [WebhookRepository, TrackedLiveRepository],
  exports: [WebhookRepository, TrackedLiveRepository],
})
export class RepositoryModule {}
