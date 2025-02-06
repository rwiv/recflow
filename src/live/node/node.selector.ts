import { Injectable } from '@nestjs/common';
import { NodePriority, NodeRecord } from './types.js';
import { ChannelPriorityEvaluator } from '../../channel/priority/priority.evaluator.js';
import { ChannelRecord } from '../../channel/business/channel.types.js';
import { findChzzkCandidate, findSoopCandidate } from './selector/utils.js';

@Injectable()
export class NodeSelector {
  constructor(private readonly evaluator: ChannelPriorityEvaluator) {}

  match(channel: ChannelRecord, nodes: NodeRecord[]): NodeRecord | null {
    const rank = this.evaluator.getRank(channel.priority);
    if (rank === 3) {
      throw new Error('Rank 3 cannot be assigned to a node');
    }
    let type: NodePriority = 'main';
    if (rank === 2) {
      type = 'sub';
    }
    if (channel.platform === 'chzzk') {
      return findChzzkCandidate(nodes, type);
    } else if (channel.platform === 'soop') {
      return findSoopCandidate(nodes, type);
    } else {
      throw new Error('Not supported platform');
    }
  }
}
