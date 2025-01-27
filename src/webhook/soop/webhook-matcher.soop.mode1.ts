import { WebhookMatcher, WebhookRecord } from '../types.js';
import { findChzzkCandidate, findSoopCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.js';
import { QueryConfig } from '../../common/query.js';

export class WebhookMatcherSoopMode1 implements WebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, webhooks: WebhookRecord[]): WebhookRecord | null {
    const forceType = this.query.options.soop.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(webhooks, forceType);
    }

    // type === "main"
    const candidate = findSoopCandidate(webhooks, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findSoopCandidate(webhooks, 'extra');
  }
}
