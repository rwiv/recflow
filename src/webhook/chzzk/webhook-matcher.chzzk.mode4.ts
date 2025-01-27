import { WebhookMatcher, WebhookRecord, WebhookType } from '../types.js';
import { QueryConfig } from '../../common/query.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.js';

export class WebhookMatcherChzzkMode4 implements WebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, webhooks: WebhookRecord[]): WebhookRecord | null {
    const forceType = this.query.options.chzzk.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(webhooks, forceType);
    }

    let type: WebhookType = 'sub';
    if (this.query.watchedChzzkChanIds.includes(live.channelId)) {
      type = 'main';
    }
    if (this.query.allowedChzzkChanNames.includes(live.channelName)) {
      type = 'main';
    }
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = 'extra';
    }

    if (type === 'main') {
      const candidate = findChzzkCandidate(webhooks, 'main');
      if (!candidate) {
        type = 'sub';
      } else {
        return candidate;
      }
    }

    if (type === 'sub') {
      const candidate = findChzzkCandidate(webhooks, 'sub');
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findChzzkCandidate(webhooks, 'extra');
  }
}
