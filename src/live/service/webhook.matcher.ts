import { Inject, Injectable } from '@nestjs/common';
import { WEBHOOK_MATCHER_CHZZK, WEBHOOK_MATCHER_SOOP } from '../webhook/webhook.module.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { WebhookMatcher, WebhookRecord } from '../webhook/types.js';

@Injectable()
export class PlatformWebhookMatcher {
  constructor(
    @Inject(WEBHOOK_MATCHER_CHZZK) private readonly chzzkMatcher: WebhookMatcher,
    @Inject(WEBHOOK_MATCHER_SOOP) private readonly soopMatcher: WebhookMatcher,
  ) {}

  matchWebhook(live: LiveInfo, webhooks: WebhookRecord[]): WebhookRecord | null {
    const matcher = this.selectMatcher(live);
    return matcher.match(live, webhooks);
  }

  private selectMatcher(live: LiveInfo) {
    if (live.type === 'chzzk') {
      return this.chzzkMatcher;
    } else if (live.type === 'soop') {
      return this.soopMatcher;
    } else {
      console.error(typeof live);
      console.error(live);
      throw new Error('Invalid live type');
    }
  }
}
