import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { NodeFinder } from './node.finder.js';
import { NodeDto } from '../spec/node.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match(channel: ChannelDto, tx: Tx = db): Promise<NodeDto | null> {
    const pfId = channel.platform.id;

    // search for available nodes
    let nodes = (await this.nodeFinder.findByNodeGteTier(channel.priority.tier, tx))
      .filter((node) => !node.isCordoned)
      .filter((node) => {
        const state = findState(node, pfId);
        if (state) return state.assigned < state.capacity;
        else return false;
      });
    if (nodes.length === 0) return null;

    // find minimum tier
    let minTier = getNodeTier(nodes[0]);
    for (let i = 0; i < nodes.length; i++) {
      const curTier = getNodeTier(nodes[i]);
      if (curTier < minTier) {
        minTier = curTier;
      }
    }
    nodes = nodes.filter((node) => getNodeTier(node) === minTier);
    if (nodes.length === 0) return null;

    // find minimum weight
    let minWeight = nodes[0].weight;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].weight < minWeight) {
        minWeight = nodes[i].weight;
      }
    }

    // select the node with the minimum assigned count
    nodes = sortedByEarliestAssigned(nodes.filter((node) => node.weight === minWeight));
    if (nodes.length === 0) return null;

    let minNode = nodes[0];
    for (let i = 0; i < nodes.length; i++) {
      const curState = findState(nodes[i], pfId);
      const minState = findState(minNode, pfId);
      if (curState.assigned < minState.assigned) {
        minNode = nodes[i];
      }
    }
    return minNode;
  }
}

function findState(node: NodeDto, platformId: string) {
  const target = node.states?.find((state) => state.platform.id === platformId);
  if (!target) {
    throw NotFoundError.from('NodeState', 'platformId', platformId);
  }
  return target;
}

function getNodeTier(node: NodeDto) {
  const tier = node.group?.tier;
  if (!tier) {
    throw new MissingValueError('tier is missing');
  }
  return tier;
}

export function sortedByEarliestAssigned(nodes: NodeDto[]) {
  return nodes.sort((a, b) => {
    if (!a.lastAssignedAt) return -1;
    if (!b.lastAssignedAt) return 1;
    return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime();
  });
}
