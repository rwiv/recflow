import { ChzzkWebhookMatcher, WebhookState, WebhookType } from '../types.js';
import { QueryConfig } from '../../common/query.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.js';

export class WebhookMatcherChzzkMode3 implements ChzzkWebhookMatcher {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null {
    const forceType = this.query.options.chzzk.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(whStates, forceType);
    }

    let type: WebhookType = 'main';
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = 'extra';
    }

    if (type === 'main') {
      const candidate = findChzzkCandidate(whStates, 'main');
      if (!candidate) {
        type = 'sub';
      } else {
        return candidate;
      }
    }

    if (type === 'sub') {
      const candidate = findChzzkCandidate(whStates, 'sub');
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findChzzkCandidate(whStates, 'extra');
  }
}
