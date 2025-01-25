import { ChzzkWebhookMatcher, WebhookState } from '../types.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/live.js';
import { QueryConfig } from '../../common/query.js';

@Injectable()
export class WebhookMatcherChzzkMode1 implements ChzzkWebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null {
    const forceType = this.query.options.chzzk.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(whStates, forceType);
    }

    // type === "main"
    const candidate = findChzzkCandidate(whStates, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findChzzkCandidate(whStates, 'extra');
  }
}
