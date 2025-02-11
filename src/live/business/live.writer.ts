import { LiveRepository } from '../persistence/live.repository.js';
import { Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { NodeFinder } from '../../node/business/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveEntAppend, LiveEntUpdate } from '../persistence/live.persistence.schema.js';
import { LiveInfo } from '../../platform/data/wapper/live.js';
import { oneNullable } from '../../utils/list.js';
import { LiveMapper } from './live.mapper.js';
import { LiveUpdate } from './live.business.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';

@Injectable()
export class LiveWriter {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly mapper: LiveMapper,
  ) {}

  async createByLive(live: LiveInfo, nodeId: string) {
    const platform = await this.pfFinder.findByNameNotNull(live.type);
    const channel = await this.channelFinder.findByPidAndPlatform(live.pid, platform.name);
    if (channel === undefined) throw NotFoundError.from('Channel', 'pid', live.pid);
    const node = await this.nodeFinder.findById(nodeId);
    if (!node) throw NotFoundError.from('Node', 'id', nodeId);
    const req: LiveEntAppend = {
      ...live,
      platformId: platform.id,
      channelId: channel.id,
      nodeId: node.id,
    };
    const ent = await this.liveRepo.create(req);
    return { ...ent, channel, platform, node };
  }

  async delete(id: string) {
    return this.liveRepo.delete(id);
  }

  async updateByLive(id: string, live: LiveInfo) {
    const req: LiveEntUpdate = { id, form: { ...live } };
    const ent = await this.liveRepo.update(req);
    return this.mapper.map(ent);
  }

  async update(update: LiveUpdate) {
    return this.mapper.map(await this.liveRepo.update(update));
  }
}
