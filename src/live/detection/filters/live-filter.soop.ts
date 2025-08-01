import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { ChannelFinder } from '../../../channel/service/channel.finder.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';
import { SoopCriterionDto } from '../../../criterion/spec/criterion.dto.schema.js';
import { SoopLiveInfo } from '../../../platform/spec/raw/soop.js';

@Injectable()
export class SoopLiveFilter {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly chFinder: ChannelFinder,
  ) {}

  async getFiltered(liveInfos: LiveInfo[], cr: SoopCriterionDto): Promise<LiveInfo[]> {
    const promises = [];
    for (const liveInfo of liveInfos) {
      promises.push(this.filter(liveInfo, cr));
    }
    return (await Promise.allSettled(promises))
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((liveInfo) => liveInfo !== null);
  }

  async filter(liveInfo: LiveInfo, cr: SoopCriterionDto): Promise<LiveInfo | null> {
    if (liveInfo.type !== 'soop') {
      throw new EnumCheckError('Invalid live type');
    }
    // ignore
    const content = liveInfo.content as SoopLiveInfo;
    for (const ignoredTag of cr.negativeTags) {
      if (content.hashTags?.includes(ignoredTag)) return null;
    }
    for (const ignoredKeyword of cr.negativeKeywords) {
      if (content.broadTitle.includes(ignoredKeyword)) return null;
    }
    const cateNo = content.broadCateNo;
    if (cateNo) {
      for (const ignoredCate of cr.negativeCates) {
        if (parseInt(cateNo) === parseInt(ignoredCate)) return null;
      }
    }

    // by channel
    if (!cr.loggingOnly) {
      const channel = await this.chFinder.findByPlatformAndSourceId('soop', liveInfo.sourceId);
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
    const channel = await this.fetcher.fetchChannel('soop', liveInfo.sourceId, false);
    if (channel === null) {
      return null;
    }
    if (channel.followerCnt >= minFollowerCnt) {
      return liveInfo;
    } else {
      return null;
    }
  }
}
