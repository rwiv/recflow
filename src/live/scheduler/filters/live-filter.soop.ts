import { QueryConfig } from '../../../common/query.js';
import { LiveFilter } from './interface.js';
import { LiveInfo } from '../../../platform/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Inject } from '@nestjs/common';
import { QUERY } from '../../../common/config.module.js';
import { ChannelFinder } from '../../../channel/business/channel.finder.js';
import { ChannelPriorityEvaluator } from '../../../channel/priority/priority.evaluator.js';

// TODO: change to abstract class and ChzzkLiveFilter extends this
export class SoopLiveFilter implements LiveFilter {
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

  async filter(live: LiveInfo): Promise<LiveInfo | null> {
    if (live.type !== 'soop') {
      throw new Error('Invalid live type');
    }

    // by channel
    const channel = await this.chanFinder.findByPidOne(live.channelId, 'soop');
    if (channel) {
      if (this.evaluator.getRank(channel.priority) === 3) {
        return null;
      } else {
        return live;
      }
    }

    // by user count
    if (live.viewCnt >= this.query.soopMinUserCnt) {
      return this.checkFollowerCnt(live, this.query.soopMinFollowerCnt);
    }

    return null;
  }

  private async checkFollowerCnt(live: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel('soop', live.channelId, false);
    if (channel === null) {
      return null;
    }
    if (channel.followerCnt >= minFollowerCnt) {
      return live;
    } else {
      return null;
    }
  }
}
