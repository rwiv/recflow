import { Injectable } from '@nestjs/common';
import { ChannelRecord } from '../../channel/channel/business/channel.business.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeFinder } from './node.finder.js';

@Injectable()
export class NodeSelector {
  constructor(private readonly nodeFinder: NodeFinder) {}

  async match2(channel: ChannelRecord) {
    const nodes = await this.nodeFinder.findByNodeTier(channel.priority.tier);
    if (nodes.length === 0) {
      throw new NotFoundError(`Not found ${channel.priority.tier} tier Nodes`);
    }
    const filtered = nodes.filter((node) => {
      const state = node.states?.find((state) => state.platform.id === channel.platform.id);
      if (state) return state.assigned < state.capacity;
      else return false;
    });
    let max = filtered[0];
    for (let i = 1; i < filtered.length; i++) {
      if (filtered[i].weight > max.weight) {
        max = filtered[i];
      }
    }
    return max;
  }
}
