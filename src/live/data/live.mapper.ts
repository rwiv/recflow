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
import { headers } from '../../common/data/common.schema.js';

export interface LiveFieldsReq {
  nodes?: boolean;
  nodeGroup?: boolean;
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
    const platformP = this.pfFinder.findByIdNotNull(liveEnt.platformId, tx);
    const channelP = this.channelFinder.findById(liveEnt.channelId, tx);
    const platform = await platformP;
    const channel = await channelP;
    if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);

    let result: LiveDtoWithNodes = {
      ...liveEnt,
      channel,
      platform,
      headers: liveEnt.headers ? headers.parse(JSON.parse(liveEnt.headers)) : null,
    };

    if (opt.nodes) {
      const req: NodeFieldsReq = { group: opt.nodeGroup ?? false, lives: false };
      const nodes = await this.nodeFinder.findByLiveId(liveEnt.id, req, tx);
      result = { ...result, nodes };
    }
    return result;
  }
}
