import { NodeSelector, NodeRecord } from '../../types.js';
import { findChzzkCandidate } from '../utils.js';
import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../../../platform/wapper/live.js';
import { QueryConfig } from '../../../../common/query.js';

@Injectable()
export class ChzzkNodeSelectorMode1 implements NodeSelector {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, webhooks: NodeRecord[]): NodeRecord | null {
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
