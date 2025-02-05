import { Synchronizer } from './synchronizer.js';
import { LiveInfo } from '../../../platform/wapper/live.js';
import { PlatformType } from '../../../platform/types.js';
import { QueryConfig } from '../../../common/query.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { TrackedLiveService } from '../../business/tracked-live.service.js';
import { LiveFilter } from '../filters/interface.js';

export class LiveInjector extends Synchronizer {
  constructor(
    private readonly platform: PlatformType,
    private readonly query: QueryConfig,
    private readonly fetcher: PlatformFetcher,
    private readonly liveService: TrackedLiveService,
    private readonly filter: LiveFilter,
  ) {
    super();
  }

  protected async check() {
    // --------------- check follow channels -------------------------------
    let channelIds: string[] = [];
    if (this.platform === 'chzzk') {
      channelIds = this.query.followChzzkChanIds;
    } else if (this.platform === 'soop') {
      channelIds = this.query.followSoopUserIds;
    }
    const promises = channelIds.map(async (userId) => {
      return { userId, live: await this.liveService.get(userId, { includeDeleted: true }) };
    });
    const untrackedFollowChannelIds = (await Promise.all(promises))
      .filter(({ live }) => !live)
      .map(({ userId }) => userId);

    const untrackedLivedFollowChannels = (
      await Promise.all(
        untrackedFollowChannelIds.map((userId) =>
          this.fetcher.fetchChannel(this.platform, userId, false),
        ),
      )
    )
      .filter((info) => info !== null)
      .filter((info) => info.openLive);

    for (const channel of untrackedLivedFollowChannels) {
      const chanWithLiveInfo = await this.fetcher.fetchChannel(this.platform, channel.pid, true);
      if (!chanWithLiveInfo) throw Error('Not found channel');
      const live = chanWithLiveInfo.liveInfo;
      if (!live) throw Error('Not found Channel.liveInfo');
      await this.liveService.add(live);
    }

    // --------------- check by query --------------------------------------
    const queriedLives = await this.fetcher.fetchLives(this.platform);
    const filtered = await this.filter.getFiltered(queriedLives);

    // add new lives
    const toBeAddedLives: LiveInfo[] = (
      await Promise.all(filtered.map(async (info) => this.isToBeAdded(info)))
    ).filter((info) => info !== null);

    for (const live of toBeAddedLives) {
      await this.liveService.add(live);
    }
  }

  /**
   * 스트리머가 방송을 종료해도 query 결과에는 노출될 수 있다.
   * 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있다.
   * 따라서 queried LiveInfo만이 아니라 ChannelInfo.openLive를 같이 확인하여 방송중인지 확인한 뒤 live 목록에 추가한다.
   */
  private async isToBeAdded(newInfo: LiveInfo) {
    if (await this.liveService.get(newInfo.channelId, { includeDeleted: true })) return null;
    const channel = await this.fetcher.fetchChannel(this.platform, newInfo.channelId, false);
    if (!channel?.openLive) return null;
    return newInfo;
  }
}
