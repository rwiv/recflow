import { QueryConfig } from '../common/query.js';
import { Streamq } from '../client/streamq.js';
import { log } from 'jslog';
import { LiveFilterSoop } from './filters/live-filter.soop.js';
import { SoopLiveInfo } from '../platform/soop.js';
import { Inject, Injectable } from '@nestjs/common';
import { QUERY } from '../common/common.module.js';
import { Allocator } from './allocator.js';
import { LiveInfo, liveFromSoop } from '../platform/live.js';
import { TargetedLiveRepository } from '../storage/repositories/targeted-live.repository.js';

@Injectable()
export class CheckerSoop {
  private isChecking: boolean = false;

  constructor(
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly streamq: Streamq,
    private readonly targeted: TargetedLiveRepository,
    private readonly allocator: Allocator,
    private readonly filter: LiveFilterSoop,
  ) {}

  async check() {
    if (this.isChecking) {
      log.info('Already checking');
      return;
    }
    this.isChecking = true;

    // --------------- check watched channels -------------------------------
    const newWatchedChannelIds = (
      await Promise.all(
        this.query.watchedSoopUserIds.map(async (userId) => ({
          userId,
          live: await this.targeted.get(userId),
        })),
      )
    )
      .filter(({ live }) => !live)
      .map(({ userId }) => userId);

    const newLivedWatchedChannels = (
      await Promise.all(
        newWatchedChannelIds.map((userId) => this.streamq.getSoopChannel(userId, false)),
      )
    )
      .filter((info) => info !== null)
      .filter((info) => info.openLive);

    for (const newChannel of newLivedWatchedChannels) {
      const channel = await this.streamq.getSoopChannel(newChannel.userId, true);
      if (!channel) throw Error('Not found soop channel');
      const live = channel.liveInfo;
      if (!live) throw Error('Not found soopChannel.liveInfo');
      await this.allocator.allocate(liveFromSoop(live));
    }

    // --------------- check by query --------------------------------------
    const queriedInfos = await this.streamq.getSoopLive(this.query);
    const filtered = await this.filter.getFiltered(queriedInfos, this.query);

    // add new LiveInfos
    const toBeAddedInfos: SoopLiveInfo[] = (
      await Promise.all(filtered.map(async (info) => this.isToBeAdded(info)))
    ).filter((info) => info !== null);

    for (const newInfo of toBeAddedInfos) {
      await this.allocator.allocate(liveFromSoop(newInfo));
    }

    // delete LiveInfos
    const toBeDeletedInfos = (
      await Promise.all(
        (await this.targeted.allSoop()).map(async (info) => this.isToBeDeleted(info)),
      )
    ).filter((info) => info !== null);

    for (const toBeDeleted of toBeDeletedInfos) {
      await this.allocator.deallocate(toBeDeleted, this.query.options.soop.defaultExitCommand);
    }

    this.isChecking = false;
  }

  private async isToBeAdded(newInfo: SoopLiveInfo) {
    if (await this.targeted.get(newInfo.userId)) return null;
    // 스트리머가 방송을 종료해도 query 결과에는 나올 수 있음
    // 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있음
    // 따라서 queried LiveInfo 뿐만 아니라 ChannelInfo를 같이 확인하여 방송중인지 확인한 뒤 리스트에 추가한다
    const channel = await this.streamq.getSoopChannel(newInfo.userId, false);
    if (!channel?.openLive) return null;
    return newInfo;
  }

  private async isToBeDeleted(existingInfo: LiveInfo) {
    const channel = await this.streamq.getSoopChannel(existingInfo.channelId, false);
    if (channel?.openLive) return null;
    return existingInfo;
  }
}
