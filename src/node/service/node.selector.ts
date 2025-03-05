import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { NodeFinder } from './node.finder.js';
import { NodeDto } from '../spec/node.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';

const LIMIT_COUNT = 100;

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match(channel: ChannelDto): Promise<NodeDto | undefined> {
    const pfId = channel.platform.id;

    // search for available nodes
    let nodes: NodeDto[] = [];
    let curTier = channel.priority.tier;
    while (true) {
      if (curTier > LIMIT_COUNT) {
        throw new FatalError('Node search limit exceeded');
      }
      // find nodes in the current tier without cordon
      const raw = (await this.nodeFinder.findByNodeTier(curTier)).filter((node) => !node.isCordoned);
      if (raw.length === 0) {
        return undefined;
      }
      // filter nodes that have available capacity
      nodes = raw.filter((node) => {
        const state = this.findState(node, pfId);
        if (state) return state.assigned < state.capacity;
        else return false;
      });
      if (nodes.length > 0) {
        break;
      }
      curTier++;
    }

    // find minimum weight
    let minWeight = nodes[0].weight;
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].weight < minWeight) {
        minWeight = nodes[i].weight;
      }
    }

    // select the node with the minimum assigned count
    const candidates = sortedByEarliestAssigned(nodes.filter((node) => node.weight === minWeight));
    let minNode = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      const curState = this.findState(candidates[i], pfId);
      const minState = this.findState(minNode, pfId);
      if (curState.assigned < minState.assigned) {
        minNode = candidates[i];
      }
    }
    return minNode;
  }

  private findState(node: NodeDto, platformId: string) {
    const target = node.states?.find((state) => state.platform.id === platformId);
    if (!target) {
      throw NotFoundError.from('NodeState', 'platformId', platformId);
    }
    return target;
  }
}

export function sortedByEarliestAssigned(nodes: NodeDto[]) {
  return nodes.sort((a, b) => {
    if (!a.lastAssignedAt) return -1;
    if (!b.lastAssignedAt) return 1;
    return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime();
  });
}
