import { Injectable } from '@nestjs/common';

import { EnumCheckError } from '@/utils/errors/errors/EnumCheckError.js';

import { ChzzkLiveInfo } from '@/platform/spec/raw/chzzk.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';

import { ChzzkCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

@Injectable()
export class ChzzkLiveFilter {
  constructor(private readonly chFinder: ChannelFinder) {}

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
      if (content.tags?.includes(ignoredTag.value)) return null;
    }
    for (const ignoredKeyword of cr.negativeKeywords) {
      if (content.liveTitle.includes(ignoredKeyword.value)) return null;
    }
    for (const ignoredWp of cr.negativeWps) {
      if (content.watchPartyNo === parseInt(ignoredWp.value)) return null;
    }

    // by channel
    if (!cr.loggingOnly) {
      const channel = await this.chFinder.findByPlatformAndSourceId('chzzk', liveInfo.channelUid);
      if (channel) {
        if (channel.grade.shouldNotify) {
          return liveInfo;
        }
        if (channel.grade.shouldSave) {
          return liveInfo;
        } else {
          return null;
        }
      }
    }

    // by user count
    if (liveInfo.viewCnt >= cr.minUserCnt) {
      return liveInfo;
    }

    return null;
  }
}
