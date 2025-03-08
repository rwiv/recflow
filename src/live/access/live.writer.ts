import { LiveRepository } from '../storage/live.repository.js';
import { Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveEntAppend } from '../spec/live.entity.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveMapper } from './live.mapper.js';
import { LiveUpdate } from '../spec/live.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';

@Injectable()
export class LiveWriter {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly mapper: LiveMapper,
  ) {}

  async createByLive(live: LiveInfo, nodeId: string, tx: Tx = db) {
    const platform = await this.pfFinder.findByNameNotNull(live.type, tx);
    const channel = await this.channelFinder.findByPidAndPlatform(live.pid, platform.name, false, tx);
    if (channel === undefined) throw NotFoundError.from('Channel', 'pid', live.pid);
    const node = await this.nodeFinder.findById(nodeId, false, false, tx);
    if (!node) throw NotFoundError.from('Node', 'id', nodeId);
    const req: LiveEntAppend = {
      ...live,
      platformId: platform.id,
      channelId: channel.id,
      nodeId: node.id,
    };
    const ent = await this.liveRepo.create(req, tx);
    return { ...ent, channel, platform, node };
  }

  async delete(id: string) {
    return this.liveRepo.delete(id);
  }

  async updateByLive(id: string, live: LiveInfo) {
    const ent = await this.liveRepo.update(id, { ...live });
    return this.mapper.map(ent);
  }

  async update(id: string, update: LiveUpdate, tx: Tx = db) {
    return this.mapper.map(await this.liveRepo.update(id, update, tx), tx);
  }
}
