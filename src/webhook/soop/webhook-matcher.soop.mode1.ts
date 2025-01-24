import { SoopWebhookMatcher, WebhookState } from '../types.js';
import { findSoopCandidate } from '../webhook.utils.js';
import { LiveInfo } from '../../platform/live.wrapper.js';

export class WebhookMatcherSoopMode1 implements SoopWebhookMatcher {
  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null {
    // type === "main"
    const candidate = findSoopCandidate(whStates, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findSoopCandidate(whStates, 'extra');
  }
}
