import { SoopWebhookMatcher, WebhookState } from '../types.js';
import { findSoopCandidate } from '../utils.js';
import { LiveInfo } from '../../platform/wrapper.live.js';

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
