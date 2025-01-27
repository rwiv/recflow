import { WebhookMatcher, WebhookRecord, WebhookType } from '../types.js';
import { QueryConfig } from '../../common/query.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.js';

export class WebhookMatcherChzzkMode2 implements WebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, webhooks: WebhookRecord[]): WebhookRecord | null {
    const forceType = this.query.options.chzzk.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(webhooks, forceType);
    }

    let type: WebhookType = 'main';
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = 'extra';
    }

    if (type === 'main') {
      const candidate = findChzzkCandidate(webhooks, 'main');
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findChzzkCandidate(webhooks, 'extra');
  }
}
