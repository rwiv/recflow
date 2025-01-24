import { ChzzkWebhookMatcher, WebhookState, WebhookType } from '../types.js';
import { QueryConfig } from '../../common/query.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.js';

export class WebhookMatcherChzzkMode2 implements ChzzkWebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null {
    let type: WebhookType = 'main';
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = 'extra';
    }

    if (type === 'main') {
      const candidate = findChzzkCandidate(whStates, 'main');
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findChzzkCandidate(whStates, 'extra');
  }
}
