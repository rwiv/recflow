import { Injectable } from '@nestjs/common';
import { NodeEnt } from '../spec/node.entity.schema.js';
import { NodeFieldsReq } from '../spec/node.dto.schema.js';
import { NodeDtoWithLives } from '../spec/node.dto.mapped.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { NodeGroupRepository } from '../storage/node-group.repository.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { LiveRepository } from '../../live/storage/live.repository.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { headers } from '../../common/data/common.schema.js';

@Injectable()
export class NodeMapper {
  constructor(
    private readonly groupRepo: NodeGroupRepository,
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
  ) {}

  async mapAll(entities: NodeEnt[], req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoWithLives[]> {
    return Promise.all(entities.map((ent) => this.map(ent, req, tx)));
  }

  async map(ent: NodeEnt, req: NodeFieldsReq, tx: Tx = db): Promise<NodeDtoWithLives> {
    let result: NodeDtoWithLives = ent;
    if (req.group) {
      const group = await this.groupRepo.findById(ent.groupId, tx);
      if (!group) throw NotFoundError.from('NodeGroup', 'id', ent.groupId);
      result = { ...result, group };
    }
    if (req.lives) {
      const liveEntities = await this.liveRepo.findByNodeId(ent.id, tx);
      const lives: LiveDto[] = [];
      for (const liveEnt of liveEntities) {
        const platform = await this.pfFinder.findByIdNotNull(liveEnt.platformId, tx);
        const channel = await this.channelFinder.findById(liveEnt.channelId, false, tx);
        if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);
        lives.push({
          ...liveEnt,
          channel,
          platform,
          headers: liveEnt.headers ? headers.parse(JSON.parse(liveEnt.headers)) : null,
        });
      }
      result = { ...result, lives };
    }
    return result;
  }
}
