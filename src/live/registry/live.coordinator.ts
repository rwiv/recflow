import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from './live.registrar.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { LiveFinder } from '../access/live.finder.js';
import { PlatformLiveFilter } from './live.filter.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { channelLiveInfo, ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';

@Injectable()
export class LiveCoordinator {
  constructor(
    private readonly channelFinder: ChannelFinder,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
    private readonly filter: PlatformLiveFilter,
  ) {}

  async registerFollowedLives() {
    const followedChannels = await this.channelFinder.findFollowedChannels();
    for (const ch of followedChannels) {
      const channelInfo = await this.fetchInfo(ch.platform.name, ch.pid, true);
      if (!channelInfo) continue;
      await this.liveRegistrar.register({ channelInfo });
    }
  }

  async registerQueriedLives(criterion: PlatformCriterionDto) {
    const queriedLives = await this.fetcher.fetchLives(criterion);
    const filtered = await this.filter.getFiltered(criterion, queriedLives);
    for (const live of filtered) {
      const channelInfo = await this.fetchInfo(live.type, live.pid, false);
      if (!channelInfo) continue;
      await this.liveRegistrar.register({ channelInfo, criterion });
    }
  }

  private async fetchInfo(
    pfName: PlatformName,
    pid: string,
    isFollowed: boolean,
    tx: Tx = db,
  ): Promise<ChannelLiveInfo | null> {
    if (await this.liveFinder.findByPid(pid, tx, { includeDisabled: true })) return null;

    if (isFollowed) {
      const chanInfo = await this.fetcher.fetchChannel(pfName, pid, false);
      if (!chanInfo?.openLive) return null;
    }

    const chanWithLive = await this.fetcher.fetchChannel(pfName, pid, true);
    // If the live status is not applied to the list (it can actually happen in chzzk)
    if (!chanWithLive?.liveInfo) return null;

    return channelLiveInfo.parse(chanWithLive);
  }
}
