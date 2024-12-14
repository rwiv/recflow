import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {QueryConfig} from "../common/config.js";
import {Streamq} from "../client/Streamq.js";

export class ChzzkLiveFilter {

  constructor(private readonly streamq: Streamq) {}

  async getFiltered(infos: ChzzkLiveInfo[], query: QueryConfig): Promise<ChzzkLiveInfo[]> {
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

      return null;
    }))).filter(info => info !== null);
  }

  private async checkFollowerCnt(info: ChzzkLiveInfo, minFollowerCnt: number): Promise<ChzzkLiveInfo | null> {
    const {followerCount} = await this.streamq.getChzzkChannel(info.channelId, false);
    if (followerCount >= minFollowerCnt) {
      return info;
    } else {
      return null;
    }
  }
}
