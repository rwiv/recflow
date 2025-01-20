import { ChzzkLiveInfo } from '../../client/types.chzzk.js';
import { ChzzkWebhookMatcher, ChzzkWebhookState } from '../types.js';
import { findChzzkCandidate } from '../utils.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookMatcherChzzkMode1 implements ChzzkWebhookMatcher {
  match(
    live: ChzzkLiveInfo,
    whStates: ChzzkWebhookState[],
  ): ChzzkWebhookState | null {
    // type === "main"
    const candidate = findChzzkCandidate(whStates, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findChzzkCandidate(whStates, 'extra');
  }
}
