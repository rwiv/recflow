import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { ChannelFinder } from '../../../channel/service/channel.finder.js';
import { EnumCheckError } from '../../../utils/errors/errors/EnumCheckError.js';
import { NodeGroupRepository } from '../../../node/storage/node-group.repository.js';
import { SoopCriterionDto } from '../../../criterion/spec/criterion.dto.schema.js';

@Injectable()
export class SoopLiveFilter {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly chFinder: ChannelFinder,
    private readonly ngRepo: NodeGroupRepository,
  ) {}

  async getFiltered(lives: LiveInfo[], cr: SoopCriterionDto): Promise<LiveInfo[]> {
    const promises = lives.map((live) => this.filter(live, cr));
    return (await Promise.all(promises)).filter((info) => info !== null);
  }

  async filter(liveInfo: LiveInfo, cr: SoopCriterionDto): Promise<LiveInfo | null> {
    if (liveInfo.type !== 'soop') {
      throw new EnumCheckError('Invalid live type');
    }

    // by channel
    const channel = await this.chFinder.findByPidAndPlatform(liveInfo.pid, 'soop');
    if (channel) {
      const ng = await this.ngRepo.findByTier(channel.priority.tier);
      if (ng) {
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
