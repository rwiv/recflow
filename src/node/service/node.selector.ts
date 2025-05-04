import { Injectable } from '@nestjs/common';
import { NodeFinder } from './node.finder.js';
import { NodeDto } from '../spec/node.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeDtoWithLives } from '../spec/node.dto.mapped.schema.js';
import { notNull } from '../../utils/null.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

export interface NodeSelectorOptions {
  ignoreNodeIds: string[];
  ignoreGroupIds: string[];
  domesticOnly: boolean;
  overseasFirst: boolean;
}

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match(opts: NodeSelectorOptions, tx: Tx = db): Promise<NodeDtoWithLives | null> {
    if (opts.domesticOnly && opts.overseasFirst) {
      throw new ValidationError('Invalid options: domesticOnly and overseasFirst cannot be both true');
    }

    if (opts.overseasFirst) {
      const node = await this._match(opts, tx);
      if (node) {
        return node;
      } else {
        return this._match({ ...opts, overseasFirst: false }, tx);
      }
    }

    return this._match(opts, tx);
  }

  async _match(opts: NodeSelectorOptions, tx: Tx = db): Promise<NodeDtoWithLives | null> {
    // search for available nodes
    let nodes = await this.findCandidateNodes(opts, tx);
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

  private async findCandidateNodes(opts: NodeSelectorOptions, tx: Tx): Promise<NodeDtoWithLives[]> {
    return (await this.nodeFinder.findAll({ lives: true }, tx))
      .filter((node) => !node.isCordoned)
      .filter((node) => !opts.ignoreNodeIds.includes(node.id))
      .filter((node) => !opts.ignoreGroupIds.includes(node.groupId))
      .filter((node) => (opts.domesticOnly ? node.isDomestic : true))
      .filter((node) => (opts.overseasFirst ? !node.isDomestic : true))
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
