import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookService } from './webhook.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { StorageModule } from '../storage/storage.module.js';
import { PlatformModule } from '../platform/platform.module.js';

@Module({
  imports: [ConfigModule, StorageModule, PlatformModule],
  providers: [WebhookService, TrackedLiveService],
  exports: [WebhookService, TrackedLiveService],
})
export class ServiceModule {}
