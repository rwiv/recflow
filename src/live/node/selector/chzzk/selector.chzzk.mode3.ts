import { INodeSelector, NodeRecord, NodePriority } from '../../types.js';
import { QueryConfig } from '../../../../common/query.js';
import { findChzzkCandidate } from '../utils.js';
import { LiveInfo } from '../../../../platform/wapper/live.js';

export class ChzzkNodeSelectorMode3 implements INodeSelector {
  constructor(private readonly query: QueryConfig) {}

  match(live: LiveInfo, nodes: NodeRecord[]): NodeRecord | null {
    const forceType = this.query.options.chzzk.forceWebhookType;
    if (forceType) {
      return findChzzkCandidate(nodes, forceType);
    }

    let type: NodePriority = 'main';
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = 'extra';
    }

    if (type === 'main') {
      const candidate = findChzzkCandidate(nodes, 'main');
      if (!candidate) {
        type = 'sub';
      } else {
        return candidate;
      }
    }

    if (type === 'sub') {
      const candidate = findChzzkCandidate(nodes, 'sub');
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findChzzkCandidate(nodes, 'extra');
  }
}
