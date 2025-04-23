import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { LiveEnt } from '../spec/live.entity.schema.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Injectable } from '@nestjs/common';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeFieldsReq } from '../../node/spec/node.dto.schema.js';
import { NodeFinder } from '../../node/service/node.finder.js';

export interface LiveFieldsReq {
  channelTags?: boolean;
  nodes?: boolean;
  nodeGroup?: boolean;
  nodeStates?: boolean;
}

@Injectable()
export class LiveMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
  ) {}

  async mapAll(lives: LiveEnt[], tx: Tx = db, opt: LiveFieldsReq): Promise<LiveDtoWithNodes[]> {
    const promises = lives.map((live) => this.map(live, tx, opt));
    return Promise.all(promises);
  }

  async map(liveEnt: LiveEnt, tx: Tx = db, opt: LiveFieldsReq = {}): Promise<LiveDtoWithNodes> {
    const platform = await this.pfFinder.findByIdNotNull(liveEnt.platformId, tx);
    const channel = await this.channelFinder.findById(liveEnt.channelId, opt.channelTags ?? false, tx);
    if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);

    let result: LiveDtoWithNodes = { ...liveEnt, channel, platform };

    if (opt.nodes) {
      const req: NodeFieldsReq = {
        group: opt.nodeGroup ?? false,
        states: opt.nodeStates ?? false,
      };
      const nodes = await this.nodeFinder.findByLiveId(liveEnt.id, req, tx);
      result = { ...result, nodes };
    }
    return result;
  }
}
