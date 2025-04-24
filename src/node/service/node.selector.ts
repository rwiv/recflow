import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { NodeFinder } from './node.finder.js';
import { NodeDto } from '../spec/node.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeDtoWithLives } from '../spec/node.dto.mapped.schema.js';
import { notNull } from '../../utils/null.js';

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match(
    channel: ChannelDto,
    ignoreNodeIds: string[] = [],
    tx: Tx = db,
  ): Promise<NodeDtoWithLives | null> {
    const pfId = channel.platform.id;

    // search for available nodes
    let nodes = await this.findCandidateNodes(ignoreNodeIds, tx);
    if (nodes.length === 0) {
      return null;
    }

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
      if (notNull(nodes[i].lives).length < notNull(minNode.lives).length) {
        minNode = nodes[i];
      }
    }
    return minNode;
  }

  private async findCandidateNodes(ignoreNodeIds: string[], tx: Tx): Promise<NodeDtoWithLives[]> {
    return (await this.nodeFinder.findAll({ lives: true }, tx))
      .filter((node) => !node.isCordoned)
      .filter((node) => !ignoreNodeIds.includes(node.id))
      .filter((node) => notNull(node.lives).length < node.capacity);
  }
}

export function sortedByEarliestAssigned(nodes: NodeDto[]) {
  return nodes.sort((a, b) => {
    if (!a.lastAssignedAt) return -1;
    if (!b.lastAssignedAt) return 1;
    return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime();
  });
}
