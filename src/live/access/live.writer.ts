import { LiveRepository } from '../storage/live.repository.js';
import { Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveEntAppend } from '../spec/live.entity.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveMapper } from './live.mapper.js';
import { LiveDto, LiveUpdate } from '../spec/live.dto.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';

@Injectable()
export class LiveWriter {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly mapper: LiveMapper,
  ) {}

  async createByLive(
    live: LiveInfo,
    nodeId: string | null,
    isDisabled: boolean,
    tx: Tx = db,
  ): Promise<LiveDto> {
    const platform = await this.pfFinder.findByNameNotNull(live.type, tx);
    const channel = await this.channelFinder.findByPidAndPlatform(live.pid, platform.name, false, tx);
    if (channel === undefined) throw NotFoundError.from('Channel', 'pid', live.pid);
    let node: NodeDto | null | undefined = null;
    if (nodeId) {
      node = await this.nodeFinder.findById(nodeId, false, false, tx);
      if (!node) throw NotFoundError.from('Node', 'id', nodeId);
    }
    const req: LiveEntAppend = {
      ...live,
      platformId: platform.id,
      channelId: channel.id,
      nodeId: nodeId,
      isDisabled,
    };
    const ent = await this.liveRepo.create(req, tx);
    return { ...ent, channel, platform, node };
  }

  async delete(id: string, tx: Tx = db) {
    return this.liveRepo.delete(id, tx);
  }

  async updateByLive(id: string, live: LiveInfo, tx: Tx = db) {
    const update: LiveUpdate = { ...live };
    return this.update(id, update, tx);
  }

  disable(id: string, tx: Tx = db) {
    const update: LiveUpdate = { nodeId: null, isDisabled: true, deletedAt: new Date() };
    return this.update(id, update, tx);
  }

  private async update(id: string, update: LiveUpdate, tx: Tx = db) {
    const updated = await this.liveRepo.update(id, update, tx);
    return this.mapper.map(updated, tx);
  }
}
