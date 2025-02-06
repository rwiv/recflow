import { INodeSelector, NodeRecord } from '../../types.js';
import { findChzzkCandidate, findSoopCandidate } from '../utils.js';
import { LiveInfo } from '../../../../platform/wapper/live.js';
import { QueryConfig } from '../../../../common/query.js';

export class SoopNodeSelectorMode1 implements INodeSelector {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, nodes: NodeRecord[]): NodeRecord | null {
    const forceType = this.query.options.soop.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(nodes, forceType);
    }

    // type === "main"
    const candidate = findSoopCandidate(nodes, 'main');
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findSoopCandidate(nodes, 'extra');
  }
}
