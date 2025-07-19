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
import { LiveDto, StreamInfo, streamInfo } from '../../live/spec/live.dto.schema.js';
import { headers, queryParams } from '../../common/data/common.schema.js';

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
        const platformP = this.pfFinder.findByIdNotNull(liveEnt.platformId, tx);
        const channelP = this.channelFinder.findById(liveEnt.channelId, tx);
        const platform = await platformP;
        const channel = await channelP;
        if (!channel) throw NotFoundError.from('Channel', 'id', liveEnt.channelId);
        let stream: StreamInfo | null = null;
        if (liveEnt.streamUrl && liveEnt.streamHeaders) {
          stream = {
            url: liveEnt.streamUrl,
            params: liveEnt.streamParams ? queryParams.parse(JSON.parse(liveEnt.streamParams)) : null,
            headers: headers.parse(JSON.parse(liveEnt.streamHeaders)),
          };
        }
        lives.push({
          ...liveEnt,
          channel,
          platform,
          stream: streamInfo.parse(stream),
        });
      }
      result = { ...result, lives };
    }
    return result;
  }
}
