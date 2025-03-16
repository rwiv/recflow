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

  async registerQueriedLives(cr: PlatformCriterionDto) {
    const followedChannels = await this.channelFinder.findFollowedChannels(cr.platform.name);
    for (const ch of followedChannels) {
      const chanInfo = await this.fetchInfo(ch.platform.name, ch.pid);
      if (!chanInfo) return;
      await this.liveRegistrar.add(chanInfo, cr);
    }

    const queriedLives = await this.fetcher.fetchLives(cr);
    const filtered = await this.filter.getFiltered(cr, queriedLives);
    for (const live of filtered) {
      const chanInfo = await this.fetchInfo(live.type, live.pid);
      if (!chanInfo) return;
      await this.liveRegistrar.add(chanInfo, cr);
    }
  }

  private async fetchInfo(pfName: PlatformName, pid: string, tx: Tx = db): Promise<ChannelLiveInfo | null> {
    if (await this.liveFinder.findByPid(pid, tx, { includeDisabled: true })) return null;

    const chanInfo = await this.fetcher.fetchChannel(pfName, pid, false, false);
    if (!chanInfo?.openLive) return null;

    const chanWithLive = await this.fetcher.fetchChannel(pfName, pid, true, false);
    if (!chanWithLive?.liveInfo) return null;

    return channelLiveInfo.parse(chanWithLive);
  }
}
