import { QueryConfig } from '../../../common/config/query.js';
import { LiveFilter } from './interface.js';
import { LiveInfo } from '../../../platform/data/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Inject } from '@nestjs/common';
import { QUERY } from '../../../common/config/config.module.js';
import { ChannelFinder } from '../../../channel/channel/business/channel.finder.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';
import { NodeGroupRepository } from '../../../node/storage/node-group.repository.js';

// TODO: change to abstract class and ChzzkLiveFilter extends this
export class SoopLiveFilter implements LiveFilter {
  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly fetcher: PlatformFetcher,
    private readonly chFinder: ChannelFinder,
    private readonly ngRepo: NodeGroupRepository,
  ) {}

  async getFiltered(lives: LiveInfo[]): Promise<LiveInfo[]> {
    const promises = lives.map((live) => this.filter(live));
    return (await Promise.all(promises)).filter((info) => info !== null);
  }

  async filter(liveInfo: LiveInfo): Promise<LiveInfo | null> {
    if (liveInfo.type !== 'soop') {
      throw new EnumCheckError('Invalid live type');
    }

    // by channel
    const channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, 'soop');
    if (channel) {
      const ng = await this.ngRepo.findByTier(channel.priority.tier);
      if (ng) {
        return liveInfo;
      } else {
        return null;
      }
    }

    // by user count
    if (liveInfo.viewCnt >= this.query.soopMinUserCnt) {
      return this.checkFollowerCnt(liveInfo, this.query.soopMinFollowerCnt);
    }

    return null;
  }

  private async checkFollowerCnt(liveInfo: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel('soop', liveInfo.pid, false);
    if (channel === null) {
      return null;
    }
    if (channel.followerCnt >= minFollowerCnt) {
      return liveInfo;
    } else {
      return null;
    }
  }
}
