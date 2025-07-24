import { ChzzkLiveInfo } from '../../../platform/spec/raw/chzzk.js';
import { LiveInfo } from '../../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Injectable } from '@nestjs/common';
import { ChannelFinder } from '../../../channel/service/channel.finder.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';
import { ChzzkCriterionDto } from '../../../criterion/spec/criterion.dto.schema.js';

@Injectable()
export class ChzzkLiveFilter {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly chFinder: ChannelFinder,
  ) {}

  async getFiltered(liveInfos: LiveInfo[], cr: ChzzkCriterionDto): Promise<LiveInfo[]> {
    const promises = [];
    for (const liveInfo of liveInfos) {
      promises.push(this.filter(liveInfo, cr));
    }
    return (await Promise.allSettled(promises))
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((liveInfo) => liveInfo !== null);
  }

  private async filter(liveInfo: LiveInfo, cr: ChzzkCriterionDto): Promise<LiveInfo | null> {
    if (liveInfo.type !== 'chzzk') {
      throw new EnumCheckError('Invalid live type');
    }
    // ignore
    const content = liveInfo.content as ChzzkLiveInfo;
    for (const ignoredTag of cr.negativeTags) {
      if (content.tags?.includes(ignoredTag)) return null;
    }
    for (const ignoredKeyword of cr.negativeKeywords) {
      if (content.liveTitle.includes(ignoredKeyword)) return null;
    }
    for (const ignoredWp of cr.negativeWps) {
      if (content.watchPartyNo === parseInt(ignoredWp)) return null;
    }

    // by channel
    if (!cr.loggingOnly) {
      const channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, 'chzzk');
      if (channel) {
        if (channel.priority.shouldNotify) {
          return liveInfo;
        }
        if (channel.priority.shouldSave) {
          return liveInfo;
        } else {
          return null;
        }
      }
    }

    // by user count
    if (liveInfo.viewCnt >= cr.sufficientUserCnt) {
      return liveInfo;
    }
    if (liveInfo.viewCnt >= cr.minUserCnt) {
      return this.checkFollowerCnt(liveInfo, cr.minFollowCnt);
    }

    return null;
  }

  private async checkFollowerCnt(liveInfo: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
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
