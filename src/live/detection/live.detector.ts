import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { GradeDto } from '../../channel/spec/grade.schema.js';
import { liveInfoAttr } from '../../common/attr/attr.live.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { channelLiveInfo, ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveHistoryRepository } from '../storage/live.history.repository.js';
import { PlatformLiveFilter } from './live.filter.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { LiveInitializer } from '../register/live.initializer.js';
import { stacktrace } from '../../utils/errors/utils.js';
import { BaseError } from '../../utils/errors/base/BaseError.js';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';

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
    const followedChannels: ChannelDto[] = await this.channelFinder.findFollowedChannels();
    await Promise.allSettled(followedChannels.map((ch: ChannelDto) => this.registerLiveByChannel(ch)));
  }

  async checkQueriedLives(criterion: PlatformCriterionDto) {
    const queriedLives: LiveInfo[] = await this.fetcher.fetchLives(criterion);
    const filtered: LiveInfo[] = await this.filter.getFiltered(criterion, queriedLives);
    if (criterion.loggingOnly) {
      await Promise.allSettled(filtered.map((live: LiveInfo) => this.addLiveHistory(live, criterion)));
    } else {
      await Promise.allSettled(filtered.map((live: LiveInfo) => this.registerLiveByLive(live, criterion)));
    }
  }

  private async registerLiveByChannel(ch: ChannelDto) {
    try {
      const channelInfo: ChannelLiveInfo | null = await this.fetchInfo({
        platformName: ch.platform.name,
        channelUid: ch.sourceId,
        preCheck: true,
      });
      if (!channelInfo) return;
      await this.liveInitializer.createNewLive({ channelInfo, isFollowed: true });
    } catch (err) {
      printError(err);
    }
  }

  private async registerLiveByLive(live: LiveInfo, criterion: PlatformCriterionDto) {
    try {
      const channelInfo: ChannelLiveInfo | null = await this.fetchInfo({
        platformName: live.type,
        channelUid: live.channelUid,
        preCheck: false,
      });
      if (!channelInfo) return;
      await this.liveInitializer.createNewLive({ channelInfo, criterionId: criterion.id });
    } catch (err) {
      printError(err);
    }
  }

  private async addLiveHistory(live: LiveInfo, criterion: PlatformCriterionDto) {
    if (await this.historyRepo.exists(criterion.platform.name, live.liveUid)) {
      return;
    }

    let grade: GradeDto | undefined = undefined;
    const channel = await this.channelFinder.findByPlatformAndSourceId(criterion.platform.name, live.channelUid);
    if (channel) {
      grade = channel.grade;
    }

    await this.historyRepo.set(criterion.platform.name, live, grade ?? null);
    log.info('New Logging Only Live', liveInfoAttr(live, { cr: criterion, gr: grade }));
  }

  private async fetchInfo(req: {
    platformName: PlatformName;
    channelUid: string;
    preCheck: boolean;
  }): Promise<ChannelLiveInfo | null> {
    const { platformName: pfName, channelUid, preCheck } = req;
    if ((await this.liveFinder.findByChannelSourceId(channelUid, {})).length > 0) return null;

    if (preCheck) {
      const chanInfo = await this.fetcher.fetchChannel(pfName, channelUid, false);
      if (!chanInfo?.openLive) return null;
    }

    const chanWithLive = await this.fetcher.fetchChannel(pfName, channelUid, true);
    // If the live status is not applied to the list (it can actually happen in chzzk)
    if (!chanWithLive?.liveInfo) return null;

    return channelLiveInfo.parse(chanWithLive);
  }
}

function printError(err: unknown) {
  if (err instanceof BaseError) {
    log.warn(err.message, { ...err.attr, stack_trace: stacktrace(err) });
  } else if (err instanceof Error) {
    log.warn(err.message, { stack_trace: stacktrace(err) });
  } else {
    log.error('UnknownError', { stack_trace: stacktrace(err) });
  }
}
