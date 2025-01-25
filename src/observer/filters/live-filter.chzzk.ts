import { ChzzkLiveInfo } from '../../platform/chzzk.js';
import { QueryConfig } from '../../common/query.js';
import { PlatformFetcher } from '../../platform/types.js';
import { LiveFilter } from './interface.js';
import { LiveInfo } from '../../platform/live.js';

export class ChzzkLiveFilter implements LiveFilter {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly query: QueryConfig,
  ) {}

  async getFiltered(infos: LiveInfo[]): Promise<LiveInfo[]> {
    const promises = infos.map(async (liveInfo) => {
      if (liveInfo.type !== 'chzzk') {
        throw new Error('Invalid live type');
      }
      const content = liveInfo.content as ChzzkLiveInfo;
      // ignore
      for (const ignoredCategory of this.query.excludedChzzkCates) {
        if (content.liveCategory === ignoredCategory) {
          return null;
        }
      }
      for (const ignoredTag of this.query.excludedChzzkTags) {
        if (content.tags.includes(ignoredTag)) {
          return null;
        }
      }
      for (const ignoredKeyword of this.query.excludedChzzkKeywords) {
        if (content.liveTitle.includes(ignoredKeyword)) {
          return null;
        }
      }

      // by channel
      if (this.query.allowedChzzkChanNames.includes(content.channelName)) {
        return liveInfo;
      }
      if (this.query.excludedChzzkChanNames.includes(content.channelName)) {
        return null;
      }
      if (this.query.excludedChzzkChanIds.includes(content.channelId)) {
        return null;
      }

      // by user count
      if (content.concurrentUserCount >= this.query.chzzkMinUserCnt) {
        return this.checkFollowerCnt(liveInfo, this.query.chzzkMinFollowerCnt);
      }

      return null;
    });
    return (await Promise.all(promises)).filter((info) => info !== null);
  }

  private async checkFollowerCnt(info: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel(info.channelId, false);
    if (!channel) {
      return null;
    }
    if (channel.followerCount >= minFollowerCnt) {
      return info;
    } else {
      return null;
    }
  }
}
