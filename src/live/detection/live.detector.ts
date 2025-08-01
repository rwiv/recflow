import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { GradeDto } from '../../channel/spec/grade.schema.js';
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
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveInitializer } from '../register/live.initializer.js';

@Injectable()
export class LiveDetector {
  constructor(
    private readonly channelFinder: ChannelFinder,
    private readonly liveFinder: LiveFinder,
    private readonly liveInitializer: LiveInitializer,
    private readonly fetcher: PlatformFetcher,
    private readonly filter: PlatformLiveFilter,
    private readonly historyRepo: LiveHistoryRepository,
  ) {}

  async checkFollowedLives() {
    const followedChannels = await this.channelFinder.findFollowedChannels();
    const promises = [];
    for (const ch of followedChannels) {
      const channelInfo = await this.fetchInfo(ch.platform.name, ch.sourceId, true);
      if (!channelInfo) continue;
      promises.push(this.liveInitializer.createNewLive({ channelInfo, isFollowed: true }));
    }
    await Promise.allSettled(promises);
  }

  async checkQueriedLives(criterion: PlatformCriterionDto) {
    const queriedLives = await this.fetcher.fetchLives(criterion);
    const filtered = await this.filter.getFiltered(criterion, queriedLives);
    if (criterion.loggingOnly) {
      await this.setLoggingOnlyLives(criterion, filtered);
    } else {
      await this.registerQueriedLives(criterion, filtered);
    }
  }

  private async registerQueriedLives(criterion: PlatformCriterionDto, lives: LiveInfo[]) {
    const promises = [];
    for (const live of lives) {
      const channelInfo = await this.fetchInfo(live.type, live.sourceId, false);
      if (!channelInfo) continue;
      promises.push(this.liveInitializer.createNewLive({ channelInfo, criterionId: criterion.id }));
    }
    await Promise.allSettled(promises);
  }

  private async setLoggingOnlyLives(criterion: PlatformCriterionDto, lives: LiveInfo[]) {
    const promises = [];
    for (const live of lives) {
      promises.push(this.setLoggingOnlyLivesOne(criterion, live));
    }
    await Promise.allSettled(promises);
  }

  private async setLoggingOnlyLivesOne(criterion: PlatformCriterionDto, live: LiveInfo) {
    if (await this.historyRepo.exists(criterion.platform.name, live.liveId)) {
      return;
    }

    let grade: GradeDto | undefined = undefined;
    const channel = await this.channelFinder.findByPlatformAndSourceId(criterion.platform.name, live.sourceId);
    if (channel) {
      grade = channel.grade;
    }

    await this.historyRepo.set(criterion.platform.name, live, grade ?? null);
    log.info('New Logging Only Live', liveInfoAttr(live, { cr: criterion, gr: grade }));
  }

  private async fetchInfo(
    pfName: PlatformName,
    sourceId: string,
    isFollowed: boolean,
    tx: Tx = db,
  ): Promise<ChannelLiveInfo | null> {
    if ((await this.liveFinder.findBySourceId(sourceId, {}, tx)).length > 0) return null;

    if (isFollowed) {
      const chanInfo = await this.fetcher.fetchChannel(pfName, sourceId, false);
      if (!chanInfo?.openLive) return null;
    }

    const chanWithLive = await this.fetcher.fetchChannel(pfName, sourceId, true);
    // If the live status is not applied to the list (it can actually happen in chzzk)
    if (!chanWithLive?.liveInfo) return null;

    return channelLiveInfo.parse(chanWithLive);
  }
}
