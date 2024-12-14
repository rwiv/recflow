import {LiveInfo} from "../client/types.js";
import {QueryConfig} from "../common/config.js";
import {StreamqClient} from "../client/StreamqClient.js";

export class LiveInfoFilter {

  constructor(private readonly streamq: StreamqClient) {}

  async getFiltered(infos: LiveInfo[], query: QueryConfig): Promise<LiveInfo[]> {
    return (await Promise.all(infos.map(async info => {
      // ignore
      for (const ignoredCategory of query.ignoredCategories) {
        if (info.liveCategory === ignoredCategory) {
          return null;
        }
      }
      for (const ignoredTag of query.ignoredTags) {
        if (info.tags.includes(ignoredTag)) {
          return null;
        }
      }
      for (const ignoredKeyword of query.ignoredKeywords) {
        if (info.liveTitle.includes(ignoredKeyword)) {
          return null;
        }
      }

      // by channel
      if (query.whiteListChannels.includes(info.channelName)) {
        return info;
      }
      if (query.ignoredChannels.includes(info.channelName)) {
        return null;
      }

      // by user count
      if (info.concurrentUserCount >= query.minUserCnt) {
        return this.checkFollowerCnt(info, query.minFollowerCnt);
      }

      // by tags
      for (const tag of info.tags) {
        if (query.sufficientTags.includes(tag)) {
          return this.checkFollowerCnt(info, query.minFollowerCnt);
        }
      }

      return null;
    }))).filter(info => info !== null);
  }

  private async checkFollowerCnt(info: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const {followerCount} = await this.streamq.requestChzzkChannel(info.channelId, false);
    if (followerCount >= minFollowerCnt) {
      return info;
    } else {
      return null;
    }
  }
}
