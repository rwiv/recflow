import {QueryConfig} from "../common/config.js";
import {Streamq} from "../client/Streamq.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export class SoopLiveFilter {

  constructor(private readonly streamq: Streamq) {}

  async getFiltered(infos: SoopLiveInfo[], query: QueryConfig): Promise<SoopLiveInfo[]> {
    return (await Promise.all(infos.map(async info => {
      // by userId
      if (query.whiteListUserIds.includes(info.userId)) {
        return info;
      }
      if (query.ignoredUserIds.includes(info.userId)) {
        return null;
      }

      // by user count
      const userCnt = parseInt(info.totalViewCnt);
      if (isNaN(userCnt)) {
        throw new Error(`Invalid totalViewCnt: ${info.totalViewCnt}`);
      }
      if (userCnt >= query.minUserCnt) {
        return this.checkFollowerCnt(info, query.minFollowerCnt);
      }

      return null;
    }))).filter(info => info !== null);
  }

  private async checkFollowerCnt(info: SoopLiveInfo, minFollowerCnt: number): Promise<SoopLiveInfo | null> {
    const channel = await this.streamq.getSoopChannel(info.userId, false);
    if (channel === null) {
      return null;
    }
    if (channel.fanCnt >= minFollowerCnt) {
      return info;
    } else {
      return null;
    }
  }
}
