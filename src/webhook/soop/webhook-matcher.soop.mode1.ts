import { SoopWebhookMatcher, WebhookState } from '../types.js';
import { findChzzkCandidate, findSoopCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.js';
import { QueryConfig } from '../../common/query.js';

export class WebhookMatcherSoopMode1 implements SoopWebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null {
    const forceType = this.query.options.soop.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(whStates, forceType);
    }

    // type === "main"
    const candidate = findSoopCandidate(whStates, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findSoopCandidate(whStates, 'extra');
  }
}
