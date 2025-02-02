import { NodeSelector, NodeRecord } from '../../types.js';
import { findChzzkCandidate, findSoopCandidate } from '../utils.js';
import { LiveInfo } from '../../../../platform/wapper/live.js';
import { QueryConfig } from '../../../../common/query.js';

export class SoopNodeSelectorMode1 implements NodeSelector {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, webhooks: NodeRecord[]): NodeRecord | null {
    const forceType = this.query.options.soop.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(webhooks, forceType);
    }

    // type === "main"
    const candidate = findSoopCandidate(webhooks, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findSoopCandidate(webhooks, 'extra');
  }
}
