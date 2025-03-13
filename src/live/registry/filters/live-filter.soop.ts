import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { ChannelFinder } from '../../../channel/service/channel.finder.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';
import { SoopCriterionDto } from '../../../criterion/spec/criterion.dto.schema.js';
import { NodeSelector } from '../../../node/service/node.selector.js';
import { SoopLiveInfo } from '../../../platform/spec/raw/soop.js';

@Injectable()
export class SoopLiveFilter {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly chFinder: ChannelFinder,
    private readonly nodeSelector: NodeSelector,
  ) {}

  async getFiltered(lives: LiveInfo[], cr: SoopCriterionDto): Promise<LiveInfo[]> {
    const promises = lives.map((live) => this.filter(live, cr));
    return (await Promise.all(promises)).filter((info) => info !== null);
  }

  async filter(liveInfo: LiveInfo, cr: SoopCriterionDto): Promise<LiveInfo | null> {
    if (liveInfo.type !== 'soop') {
      throw new EnumCheckError('Invalid live type');
    }
    // ignore
    const content = liveInfo.content as SoopLiveInfo;
    for (const ignoredTag of cr.negativeTags) {
      if (content.hashTags && content.hashTags.includes(ignoredTag)) return null;
    }
    for (const ignoredKeyword of cr.negativeKeywords) {
      if (content.broadTitle.includes(ignoredKeyword)) return null;
    }

    // by channel
    const channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, 'soop');
    if (channel) {
      if (channel.priority.shouldNotify) {
        return liveInfo;
      }
      if (await this.nodeSelector.match(channel)) {
        return liveInfo;
      } else {
        return null;
      }
    }

    // by user count
    if (liveInfo.viewCnt >= cr.minUserCnt) {
      return this.checkFollowerCnt(liveInfo, cr.minFollowCnt);
    }

    return null;
  }

  private async checkFollowerCnt(liveInfo: LiveInfo, minFollowerCnt: number): Promise<LiveInfo | null> {
    const channel = await this.fetcher.fetchChannel('soop', liveInfo.pid, false);
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
