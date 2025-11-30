import { Injectable } from '@nestjs/common';

import { ValidationError } from '@/utils/errors/errors/ValidationError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeDto } from '@/node/spec/node.dto.schema.js';
import { NodeDtoMapped } from '@/node/spec/node.dto.schema.mapped.js';

export interface NodeSelectorArgs {
  ignoreNodeIds: string[];
  ignoreGroupIds: string[];
  domesticOnly: boolean;
  overseasFirst: boolean;
}

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match(args: NodeSelectorArgs, tx: Tx = db): Promise<NodeDtoMapped | null> {
    if (args.domesticOnly && args.overseasFirst) {
      throw new ValidationError('Invalid options: domesticOnly and overseasFirst cannot be both true');
    }

    if (args.overseasFirst) {
      const node = await this._match(args, tx);
      if (node) {
        return node;
      } else {
        return this._match({ ...args, overseasFirst: false }, tx);
      }
    }

    return this._match(args, tx);
  }

  async _match(opts: NodeSelectorArgs, tx: Tx = db): Promise<NodeDtoMapped | null> {
    // search for available nodes
    let nodes = await this.findCandidateNodes(opts, tx);
    if (nodes.length === 0) {
      return null;
    }

    // find minimum priority
    let minPriority = nodes[0].priority;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].priority < minPriority) {
        minPriority = nodes[i].priority;
      }
    }

    // select the node with the minimum assigned count
    nodes = sortedByEarliestAssigned(nodes.filter((node) => node.priority === minPriority));
    if (nodes.length === 0) return null;

    let minNode = nodes[0];
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].livesCnt < minNode.livesCnt) {
        minNode = nodes[i];
      }
    }
    return minNode;
  }

  private async findCandidateNodes(opts: NodeSelectorArgs, tx: Tx): Promise<NodeDtoMapped[]> {
    return (await this.nodeFinder.findAll({}, tx))
      .filter((node) => !node.isCordoned)
      .filter((node) => !opts.ignoreNodeIds.includes(node.id))
      .filter((node) => !opts.ignoreGroupIds.includes(node.groupId))
      .filter((node) => (opts.domesticOnly ? node.isDomestic : true))
      .filter((node) => (opts.overseasFirst ? !node.isDomestic : true))
      .filter((node) => node.livesCnt < node.capacity);
  }
}

export function sortedByEarliestAssigned(nodes: NodeDto[]) {
  return nodes.sort((a, b) => {
    if (!a.lastAssignedAt) return -1;
    if (!b.lastAssignedAt) return 1;
    return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime();
  });
}
