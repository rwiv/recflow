import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { PriorityDto } from '../../channel/spec/priority.schema.js';
import { liveInfoAttr } from '../../common/attr/attr.live.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { channelLiveInfo, ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveHistoryRepository } from '../storage/live.history.repository.js';
import { PlatformLiveFilter } from './live.filter.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';

@Injectable()
export class LiveCoordinator {
  constructor(
    private readonly channelFinder: ChannelFinder,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
    private readonly filter: PlatformLiveFilter,
    private readonly historyRepo: LiveHistoryRepository,
  ) {}

  async registerFollowedLives() {
    const followedChannels = await this.channelFinder.findFollowedChannels();
    for (const ch of followedChannels) {
      const channelInfo = await this.fetchInfo(ch.platform.name, ch.pid, true);
      if (!channelInfo) continue;
      await this.liveRegistrar.createNewLive({ channelInfo, isFollowed: true });
    }
  }

  async registerQueriedLives(criterion: PlatformCriterionDto) {
    const queriedLives = await this.fetcher.fetchLives(criterion);
    const filtered = await this.filter.getFiltered(criterion, queriedLives);
    if (criterion.loggingOnly) {
      await this.filterQueriedLoggingOnly(criterion, filtered);
    } else {
      await this.filterQueriedDefault(criterion, filtered);
    }
  }

  private async filterQueriedDefault(criterion: PlatformCriterionDto, lives: LiveInfo[]) {
    for (const live of lives) {
      const channelInfo = await this.fetchInfo(live.type, live.pid, false);
      if (!channelInfo) continue;
      await this.liveRegistrar.createNewLive({ channelInfo, criterionId: criterion.id });
    }
  }

  private async filterQueriedLoggingOnly(criterion: PlatformCriterionDto, lives: LiveInfo[]) {
    for (const live of lives) {
      if (await this.historyRepo.exists(criterion.platform.name, live.liveId)) {
        continue;
      }

      let priority: PriorityDto | undefined = undefined;
      const channel = await this.channelFinder.findByPidAndPlatform(live.pid, criterion.platform.name);
      if (channel) {
        priority = channel.priority;
      }

      await this.historyRepo.set(criterion.platform.name, live, priority ?? null);
      log.info('New Logging Only Live', liveInfoAttr(live, { cr: criterion, pri: priority }));
    }
  }

  private async fetchInfo(
    pfName: PlatformName,
    pid: string,
    isFollowed: boolean,
    tx: Tx = db,
  ): Promise<ChannelLiveInfo | null> {
    if ((await this.liveFinder.findByPid(pid, {}, tx)).length > 0) return null;

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
