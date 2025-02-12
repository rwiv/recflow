import { Injectable } from '@nestjs/common';
import { ChannelRecord } from '../../channel/channel/business/channel.business.schema.js';
import { NodeFinder } from './node.finder.js';
import { NodeDto } from '../spec/node.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';

const LIMIT_COUNT = 100;

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match(channel: ChannelRecord) {
    const pfId = channel.platform.id;

    // search for available nodes
    let nodes: NodeDto[] = [];
    let curTier = channel.priority.tier;
    while (true) {
      if (curTier > LIMIT_COUNT) {
        throw new FatalError('Node search limit exceeded');
      }
      const raw = await this.nodeFinder.findByNodeTier(curTier);
      if (raw.length === 0) {
        throw new NotFoundError(`No available nodes: channelName="${channel.username}"`);
      }
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
    const candidates = nodes.filter((node) => node.weight === minWeight);
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
