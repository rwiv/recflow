import { ChzzkLiveInfoReq } from '../../platform/chzzk.req.js';
import { QueryConfig } from '../../common/query.js';
import { Streamq } from '../../client/streamq.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveFilterChzzk {
  constructor(private readonly streamq: Streamq) {}

  async getFiltered(
    infos: ChzzkLiveInfoReq[],
    query: QueryConfig,
  ): Promise<ChzzkLiveInfoReq[]> {
    return (
      await Promise.all(
        infos.map(async (info) => {
          // ignore
          for (const ignoredCategory of query.excludedChzzkCates) {
            if (info.liveCategory === ignoredCategory) {
              return null;
            }
          }
          for (const ignoredTag of query.excludedChzzkTags) {
            if (info.tags.includes(ignoredTag)) {
              return null;
            }
          }
          for (const ignoredKeyword of query.excludedChzzkKeywords) {
            if (info.liveTitle.includes(ignoredKeyword)) {
              return null;
            }
          }

          // by channel
          if (query.allowedChzzkChanNames.includes(info.channelName)) {
            return info;
          }
          if (query.excludedChzzkChanNames.includes(info.channelName)) {
            return null;
          }
          if (query.excludedChzzkChanIds.includes(info.channelId)) {
            return null;
          }

          // by user count
          if (info.concurrentUserCount >= query.chzzkMinUserCnt) {
            return this.checkFollowerCnt(info, query.chzzkMinFollowerCnt);
          }

          return null;
        }),
      )
    ).filter((info) => info !== null);
  }

  private async checkFollowerCnt(
    info: ChzzkLiveInfoReq,
    minFollowerCnt: number,
  ): Promise<ChzzkLiveInfoReq | null> {
    const { followerCount } = await this.streamq.getChzzkChannel(
      info.channelId,
      false,
    );
    if (followerCount >= minFollowerCnt) {
      return info;
    } else {
      return null;
    }
  }
}
