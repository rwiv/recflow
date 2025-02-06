import { ChzzkLiveInfo } from '../../../platform/raw/chzzk.js';
import { QueryConfig } from '../../../common/query.js';
import { LiveFilter } from './interface.js';
import { LiveInfo } from '../../../platform/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../../../common/config.module.js';
import { ChannelFinder } from '../../../channel/business/channel.finder.js';
import { ChannelPriorityEvaluator } from '../../../channel/priority/priority.evaluator.js';

@Injectable()
export class ChzzkLiveFilter implements LiveFilter {
  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly fetcher: PlatformFetcher,
    private readonly chanFinder: ChannelFinder,
    private readonly evaluator: ChannelPriorityEvaluator,
  ) {}

  async getFiltered(lives: LiveInfo[]): Promise<LiveInfo[]> {
    const promises = lives.map((live) => this.filter(live));
    return (await Promise.all(promises)).filter((info) => info !== null);
  }

  private async filter(live: LiveInfo): Promise<LiveInfo | null> {
    if (live.type !== 'chzzk') {
      throw new Error('Invalid live type');
    }
    const content = live.content as ChzzkLiveInfo;
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
    const channel = await this.chanFinder.findByPidOne(live.channelId, 'chzzk');
    if (channel) {
      if (this.evaluator.getRank(channel.priority) === 3) {
        return null;
      } else {
        return live;
      }
    }

    // by user count
    if (live.viewCnt >= this.query.chzzkMinUserCnt) {
      return this.checkFollowerCnt(live, this.query.chzzkMinFollowerCnt);
    }

    return null;
  }

  private async checkFollowerCnt(live: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel('chzzk', live.channelId, false);
    if (!channel) {
      return null;
    }
    if (channel.followerCnt >= minFollowerCnt) {
      return live;
    } else {
      return null;
    }
  }
}
