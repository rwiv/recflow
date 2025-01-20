import { QueryConfig } from '../../common/query.js';
import { Streamq } from '../../client/streamq.js';
import { SoopLiveInfoReq } from '../../platform/soop.req.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveFilterSoop {
  constructor(private readonly streamq: Streamq) {}

  async getFiltered(
    infos: SoopLiveInfoReq[],
    query: QueryConfig,
  ): Promise<SoopLiveInfoReq[]> {
    return (
      await Promise.all(
        infos.map(async (info) => {
          // by userId
          if (query.allowedSoopUserIds.includes(info.userId)) {
            return info;
          }
          if (query.excludedSoopUserIds.includes(info.userId)) {
            return null;
          }

          // by user count
          const userCnt = parseInt(info.totalViewCnt);
          if (isNaN(userCnt)) {
            throw new Error(`Invalid totalViewCnt: ${info.totalViewCnt}`);
          }
          if (userCnt >= query.soopMinUserCnt) {
            return this.checkFollowerCnt(info, query.soopMinFollowerCnt);
          }

          return null;
        }),
      )
    ).filter((info) => info !== null);
  }

  private async checkFollowerCnt(
    info: SoopLiveInfoReq,
    minFollowerCnt: number,
  ): Promise<SoopLiveInfoReq | null> {
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
