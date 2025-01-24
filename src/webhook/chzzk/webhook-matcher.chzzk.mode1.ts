import { ChzzkWebhookMatcher, WebhookState } from '../types.js';
import { findChzzkCandidate } from '../webhook.utils.js';
import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/live.wrapper.js';

@Injectable()
export class WebhookMatcherChzzkMode1 implements ChzzkWebhookMatcher {
  match(live: LiveInfo, whStates: WebhookState[]): WebhookState | null {
    // type === "main"
    const candidate = findChzzkCandidate(whStates, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findChzzkCandidate(whStates, 'extra');
  }
}
