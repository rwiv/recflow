import { Module } from '@nestjs/common';
import { ConfigModule } from '../../common/config.module.js';
import { WebhookService } from './webhook.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { LivePersistenceModule } from '../persistence/persistence.module.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { LiveEventModule } from '../event/event.module.js';
import { PlatformWebhookMatcher } from './webhook.matcher.js';
import { WebhookModule } from '../webhook/webhook.module.js';

@Module({
  imports: [ConfigModule, LivePersistenceModule, PlatformModule, WebhookModule, LiveEventModule],
  providers: [WebhookService, TrackedLiveService, PlatformWebhookMatcher],
  exports: [WebhookService, TrackedLiveService],
})
export class LiveServiceModule {}
