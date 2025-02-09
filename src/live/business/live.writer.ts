import { LiveRepository } from '../persistence/live.repository.js';
import { Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { NodeFinder } from '../../node/business/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { LiveEntAppend, LiveEntUpdate } from '../persistence/live.persistence.schema.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { oneNullable } from '../../utils/list.js';
import { LiveMapper } from './live.mapper.js';

@Injectable()
export class LiveWriter {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly pfRepo: PlatformRepository,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
    private readonly mapper: LiveMapper,
  ) {}

  // TODO: remove
  async get(pid: string) {
    const ent = oneNullable(await this.liveRepo.findByPid(pid));
    if (!ent) return undefined;
    return this.mapper.map(ent);
  }

  async create(live: LiveInfo, nodeId: string) {
    const platform = await this.pfRepo.findByName(live.type);
    if (!platform) throw new NotFoundError('Not Found Platform');
    const channel = oneNullable(await this.channelFinder.findByPid(live.channelId));
    if (!channel) throw new NotFoundError('Not Found Channel');
    const node = await this.nodeFinder.findById(nodeId);
    if (!node) throw new NotFoundError('Not Found Node');
    const req: LiveEntAppend = {
      ...live,
      raw: JSON.stringify(live.content),
      platformId: platform.id,
      channelId: channel.id,
      nodeId: node.id,
    };
    return this.liveRepo.create(req);
  }

  async delete(id: string) {
    return this.liveRepo.delete(id);
  }

  async update(id: string, channelId: string, live: LiveInfo) {
    const req: LiveEntUpdate = {
      id,
      form: {
        ...live,
        channelId,
        raw: JSON.stringify(live),
      },
    };
    return this.liveRepo.update(req);
  }
}
