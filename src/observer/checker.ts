import { QueryConfig } from '../common/query.js';
import { log } from 'jslog';
import { Allocator } from './allocator.js';
import { LiveInfo } from '../platform/live.js';
import { TargetedLiveRepository } from '../storage/repositories/targeted-live.repository.js';
import { PlatformFetcher } from '../platform/types.js';
import { LiveFilter } from './filters/interface.js';

export class PlatformChecker {
  private isChecking: boolean = false;

  constructor(
    private readonly query: QueryConfig,
    private readonly fetcher: PlatformFetcher,
    private readonly targeted: TargetedLiveRepository,
    private readonly allocator: Allocator,
    private readonly filter: LiveFilter,
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
        newWatchedChannelIds.map((userId) => this.fetcher.fetchChannel(userId, false)),
      )
    )
      .filter((info) => info !== null)
      .filter((info) => info.openLive);

    for (const newChannel of newLivedWatchedChannels) {
      const channel = await this.fetcher.fetchChannel(newChannel.id, true);
      if (!channel) throw Error('Not found channel');
      const live = channel.liveInfo;
      if (!live) throw Error('Not found Channel.liveInfo');
      await this.allocator.allocate(live);
    }

    // --------------- check by query --------------------------------------
    const queriedInfos = await this.fetcher.fetchLives();
    const filtered = await this.filter.getFiltered(queriedInfos);

    // add new LiveInfos
    const toBeAddedInfos: LiveInfo[] = (
      await Promise.all(filtered.map(async (info) => this.isToBeAdded(info)))
    ).filter((info) => info !== null);

    for (const newInfo of toBeAddedInfos) {
      await this.allocator.allocate(newInfo);
    }

    // delete LiveInfos
    const toBeDeletedInfos = (
      await Promise.all((await this.targeted.all()).map(async (info) => this.isToBeDeleted(info)))
    ).filter((info) => info !== null);

    for (const toBeDeleted of toBeDeletedInfos) {
      await this.allocator.deallocate(toBeDeleted);
    }

    this.isChecking = false;
  }

  private async isToBeAdded(newInfo: LiveInfo) {
    if (await this.targeted.get(newInfo.channelId)) return null;
    // 스트리머가 방송을 종료해도 query 결과에는 나올 수 있음
    // 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있음
    // 따라서 queried LiveInfo 뿐만 아니라 ChannelInfo를 같이 확인하여 방송중인지 확인한 뒤 리스트에 추가한다
    const channel = await this.fetcher.fetchChannel(newInfo.channelId, false);
    if (!channel?.openLive) return null;
    return newInfo;
  }

  private async isToBeDeleted(existingInfo: LiveInfo) {
    const channel = await this.fetcher.fetchChannel(existingInfo.channelId, false);
    if (channel?.openLive) return null;
    return existingInfo;
  }
}
