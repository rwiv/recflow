import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookStateRepository } from './webhook/webhook-state.repository.js';
import { TargetedLiveRepository } from './targeted/targeted-live.repository.js';
import { StorageModule } from './storage.module.js';

@Module({
  imports: [ConfigModule, StorageModule],
  providers: [WebhookStateRepository, TargetedLiveRepository],
  exports: [WebhookStateRepository, TargetedLiveRepository],
})
export class RepositoryModule {}
