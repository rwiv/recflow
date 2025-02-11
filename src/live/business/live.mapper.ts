import { LiveRecord } from './live.business.schema.js';
import { LiveEnt } from '../persistence/live.persistence.schema.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { NodeFinder } from '../../node/business/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { platformRecord } from '../../platform/platform.schema.js';
import { Injectable } from '@nestjs/common';

export interface LiveMapOpt {
  withChannelTags?: boolean;
  withNode?: boolean;
  withNodeGroup?: boolean;
  withNodeStates?: boolean;
}

@Injectable()
export class LiveMapper {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
  ) {}

  async mapAll(lives: LiveEnt[], opt: LiveMapOpt): Promise<LiveRecord[]> {
    const promises = lives.map((live) => this.map(live, opt));
    return Promise.all(promises);
  }

  async map(liveEnt: LiveEnt, opt: LiveMapOpt = {}): Promise<LiveRecord> {
    const withChannelTags = opt.withChannelTags ?? false;
    const withNode = opt.withNode ?? false;
    const withNodeGroup = opt.withNodeGroup ?? false;
    const withNodeStates = opt.withNodeStates ?? false;

    const platform = await this.pfRepo.findById(liveEnt.platformId);
    if (!platform) throw NotFoundError.from('Platform', 'id', liveEnt.platformId);
    const channel = await this.channelFinder.findById(liveEnt.channelId, withChannelTags);
    if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);

    let result: LiveRecord = { ...liveEnt, channel, platform: platformRecord.parse(platform) };

    if (withNode) {
      const node = await this.nodeFinder.findById(liveEnt.nodeId, withNodeGroup, withNodeStates);
      if (!node) throw NotFoundError.from('Node', 'id', liveEnt.nodeId);
      result = { ...result, node };
    }
    return result;
  }
}
