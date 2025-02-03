import { QueryConfig } from '../../../common/query.js';
import { SoopLiveInfo } from '../../../platform/raw/soop.js';
import { LiveFilter } from './interface.js';
import { LiveInfo } from '../../../platform/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Inject } from '@nestjs/common';
import { QUERY } from '../../../common/config.module.js';

export class SoopLiveFilter implements LiveFilter {
  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async getFiltered(infos: LiveInfo[]): Promise<LiveInfo[]> {
    const promises = infos.map(async (liveInfo) => {
      if (liveInfo.type !== 'soop') {
        throw new Error('Invalid live type');
      }
      const info = liveInfo.content as SoopLiveInfo;
      // by userId
      if (this.query.allowedSoopUserIds.includes(info.userId)) {
        return liveInfo;
      }
      if (this.query.excludedSoopUserIds.includes(info.userId)) {
        return null;
      }

      // by user count
      const userCnt = parseInt(info.totalViewCnt);
      if (isNaN(userCnt)) {
        throw new Error(`Invalid totalViewCnt: ${info.totalViewCnt}`);
      }
      if (userCnt >= this.query.soopMinUserCnt) {
        return this.checkFollowerCnt(liveInfo, this.query.soopMinFollowerCnt);
      }

      return null;
    });
    return (await Promise.all(promises)).filter((info) => info !== null);
  }

  private async checkFollowerCnt(info: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel('soop', info.channelId, false);
    if (channel === null) {
      return null;
    }
    if (channel.followerCnt >= minFollowerCnt) {
      return info;
    } else {
      return null;
    }
  }
}
