import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveEnt } from '../spec/live.entity.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Injectable } from '@nestjs/common';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';

export interface LiveMapOpt {
  withChannelTags?: boolean;
  withNode?: boolean;
  withNodeGroup?: boolean;
  withNodeStates?: boolean;
}

@Injectable()
export class LiveMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
  ) {}

  async mapAll(lives: LiveEnt[], tx: Tx = db, opt: LiveMapOpt): Promise<LiveDto[]> {
    const promises = lives.map((live) => this.map(live, tx, opt));
    return Promise.all(promises);
  }

  async map(liveEnt: LiveEnt, tx: Tx = db, opt: LiveMapOpt = {}): Promise<LiveDto> {
    const withChannelTags = opt.withChannelTags ?? false;
    const withNode = opt.withNode ?? false;
    const withNodeGroup = opt.withNodeGroup ?? false;
    const withNodeStates = opt.withNodeStates ?? false;

    const platform = await this.pfFinder.findByIdNotNull(liveEnt.platformId, tx);
    const channel = await this.channelFinder.findById(liveEnt.channelId, withChannelTags, tx);
    if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);

    let result: LiveDto = { ...liveEnt, channel, platform };

    if (withNode) {
      if (liveEnt.nodeId) {
        const node = await this.nodeFinder.findById(liveEnt.nodeId, withNodeGroup, withNodeStates, tx);
        if (!node) throw NotFoundError.from('Node', 'id', liveEnt.nodeId);
        result = { ...result, node };
      } else {
        result = { ...result, node: null };
      }
    }
    return result;
  }
}
