import { Module } from '@nestjs/common';
import { ConfigModule } from '../common/common.module.js';
import { WebhookMatcherSoopMode1 } from './soop/webhook-matcher.soop.mode1.js';
import { WebhookFactory } from './webhook.factory.js';

export const WEBHOOK_MATCHER_CHZZK = 'WebhookMatcherChzzk';
export const WEBHOOK_MATCHER_SOOP = 'WebhookMatcherSoop';

@Module({
  imports: [ConfigModule],
  providers: [
    WebhookFactory,
    {
      provide: WEBHOOK_MATCHER_CHZZK,
      useFactory: (factory: WebhookFactory) => factory.createChzzkWebhookMatcher(),
      inject: [WebhookFactory],
    },
    {
      provide: WEBHOOK_MATCHER_SOOP,
      useFactory: (factory: WebhookFactory) => factory.createSoopWebhookMatcher(),
      inject: [WebhookFactory],
    },
  ],
  exports: [WEBHOOK_MATCHER_CHZZK, WEBHOOK_MATCHER_SOOP],
})
export class WebhookModule {}
