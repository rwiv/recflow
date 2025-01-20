import { log } from 'jslog';
import { ChzzkLiveInfo } from '../client/types.chzzk.js';
import { Streamq } from '../client/streamq.js';
import { ChzzkTargetRepository } from '../storage/types.js';
import { QueryConfig } from '../common/query.js';
import { LiveFilterChzzk } from './live-filter.chzzk.js';
import { AllocatorChzzk } from './allocator.chzzk.js';
import { QUERY } from '../common/common.module.js';
import { Inject, Injectable } from '@nestjs/common';
import { TARGET_REPOSITORY_CHZZK } from '../storage/stroage.module.js';

@Injectable()
export class CheckerChzzk {
  private isChecking: boolean = false;

  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly streamq: Streamq,
    @Inject(TARGET_REPOSITORY_CHZZK)
    private readonly targets: ChzzkTargetRepository,
    private readonly allocator: AllocatorChzzk,
    private readonly filter: LiveFilterChzzk,
  ) {}

  async check() {
    if (this.isChecking) {
      log.info('Already checking');
      return;
    }
    this.isChecking = true;

    // --------------- check by subscriptions -------------------------------
    const newSubsChannelIds = (
      await Promise.all(
        this.query.subsChzzkChanIds.map(async (channelId) => ({
          channelId,
          live: await this.targets.get(channelId),
        })),
      )
    )
      .filter(({ live }) => !live)
      .map(({ channelId }) => channelId);

    const newLiveSubsChannels = (
      await Promise.all(
        newSubsChannelIds.map((channelId) =>
          this.streamq.getChzzkChannel(channelId, false),
        ),
      )
    ).filter((info) => info.openLive);

    for (const newChannel of newLiveSubsChannels) {
      const live = (
        await this.streamq.getChzzkChannel(newChannel.channelId, true)
      ).liveInfo;
      if (!live) throw Error('Not found chzzkChannel.liveInfo');
      await this.allocator.allocate(live);
    }

    // --------------- check by query --------------------------------------
    const queriedInfos = await this.streamq.getChzzkLive(this.query);
    const filtered = await this.filter.getFiltered(queriedInfos, this.query);

    // add new LiveInfos
    const toBeAddedInfos: ChzzkLiveInfo[] = (
      await Promise.all(filtered.map(async (info) => this.isToBeAdded(info)))
    ).filter((info) => info !== null);

    for (const newInfo of toBeAddedInfos) {
      await this.allocator.allocate(newInfo);
    }

    // delete LiveInfos
    const toBeDeletedInfos: ChzzkLiveInfo[] = (
      await Promise.all(
        (await this.targets.all()).map(async (info) =>
          this.isToBeDeleted(info),
        ),
      )
    ).filter((info) => info !== null);

    for (const toBeDeleted of toBeDeletedInfos) {
      await this.allocator.deallocate(toBeDeleted);
    }

    this.isChecking = false;
  }

  private async isToBeAdded(newInfo: ChzzkLiveInfo) {
    if (await this.targets.get(newInfo.channelId)) return null;
    // 스트리머가 방송을 종료해도 query 결과에는 나올 수 있음
    // 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있음
    // 따라서 queried LiveInfo 뿐만 아니라 ChannelInfo를 같이 확인하여 방송중인지 확인한 뒤 리스트에 추가한다
    const { openLive } = await this.streamq.getChzzkChannel(
      newInfo.channelId,
      false,
    );
    if (!openLive) return null;
    return newInfo;
  }

  private async isToBeDeleted(existingInfo: ChzzkLiveInfo) {
    const { openLive } = await this.streamq.getChzzkChannel(
      existingInfo.channelId,
      false,
    );
    if (openLive) return null;
    return existingInfo;
  }
}
