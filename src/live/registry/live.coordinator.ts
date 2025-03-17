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
import { log } from 'jslog';

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
      const chanInfo = await this.fetchInfo(ch.platform.name, ch.pid, true);
      if (!chanInfo) return;
      await this.liveRegistrar.add(chanInfo, cr);
    }

    const queriedLives = await this.fetcher.fetchLives(cr);
    log.info('Queried Live Count', { count: queriedLives.length });
    const filtered = await this.filter.getFiltered(cr, queriedLives);
    log.info('Filtered Live Count', { count: filtered.length });
    for (const live of filtered) {
      log.info('Register Live', { channel: live.channelName, title: live.liveTitle });
      const chanInfo = await this.fetchInfo(live.type, live.pid, false);
      if (!chanInfo) return;
      await this.liveRegistrar.add(chanInfo, cr);
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
