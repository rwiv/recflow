import { WebhookMatcher, WebhookRecord } from '../types.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../../platform/wapper/live.js';
import { QueryConfig } from '../../../common/query.js';

@Injectable()
export class WebhookMatcherChzzkMode1 implements WebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, webhooks: WebhookRecord[]): WebhookRecord | null {
    const forceType = this.query.options.chzzk.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(webhooks, forceType);
    }

    // type === "main"
    const candidate = findChzzkCandidate(webhooks, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findChzzkCandidate(webhooks, 'extra');
  }
}
