import { ChzzkLiveInfo } from '../../../platform/data/raw/chzzk.js';
import { QueryConfig } from '../../../common/config/query.js';
import { LiveFilter } from './interface.js';
import { LiveInfo } from '../../../platform/data/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../../../common/config/config.module.js';
import { ChannelFinder } from '../../../channel/channel/business/channel.finder.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';
import { NodeGroupRepository } from '../../../node/persistence/node-group.repository.js';

@Injectable()
export class ChzzkLiveFilter implements LiveFilter {
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

  private async filter(liveInfo: LiveInfo): Promise<LiveInfo | null> {
    if (liveInfo.type !== 'chzzk') {
      throw new EnumCheckError('Invalid live type');
    }
    const content = liveInfo.content as ChzzkLiveInfo;
    // ignore
    for (const ignoredCategory of this.query.excludedChzzkCates) {
      if (content.liveCategory === ignoredCategory) return null;
    }
    for (const ignoredTag of this.query.excludedChzzkTags) {
      if (content.tags.includes(ignoredTag)) return null;
    }
    for (const ignoredKeyword of this.query.excludedChzzkKeywords) {
      if (content.liveTitle.includes(ignoredKeyword)) return null;
    }

    // by channel
    const channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, 'chzzk');
    if (channel) {
      const ng = await this.ngRepo.findByTier(channel.priority.tier);
      if (ng.length > 0) {
        return liveInfo;
      } else {
        return null;
      }
    }

    // by user count
    if (liveInfo.viewCnt >= this.query.chzzkMinUserCnt) {
      return this.checkFollowerCnt(liveInfo, this.query.chzzkMinFollowerCnt);
    }

    return null;
  }

  private async checkFollowerCnt(
    liveInfo: LiveInfo,
    minFollowerCnt: number,
  ): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel('chzzk', liveInfo.pid, false);
    if (!channel) {
      return null;
    }
    if (channel.followerCnt >= minFollowerCnt) {
      return liveInfo;
    } else {
      return null;
    }
  }
}
