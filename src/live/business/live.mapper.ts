import { LiveRecord } from './live.business.schema.js';
import { LiveEnt } from '../persistence/live.persistence.schema.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { NodeFinder } from '../../node/business/node.finder.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { oneNullable } from '../../utils/list.js';
import { platformRecord } from '../../platform/platform.schema.js';

export class LiveMapper {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly channelFinder: ChannelFinder,
    private readonly nodeFinder: NodeFinder,
  ) {}

  async mapAll(lives: LiveEnt[], withNode: boolean = false): Promise<LiveRecord[]> {
    return Promise.all(lives.map((live) => this.map(live, withNode)));
  }

  async map(live: LiveEnt, withNode: boolean = false): Promise<LiveRecord> {
    const platform = await this.pfRepo.findById(live.platformId);
    if (!platform) throw new NotFoundError('Not Found Platform');
    const channel = oneNullable(await this.channelFinder.findByPid(live.channelId));
    if (!channel) throw new NotFoundError('Not Found Channel');

    let result: LiveRecord = { ...live, channel, platform: platformRecord.parse(platform) };

    if (withNode) {
      const node = await this.nodeFinder.findById(live.nodeId);
      if (!node) throw new NotFoundError('Not Found Node');
      result = { ...result, node };
    }
    return result;
  }
}
