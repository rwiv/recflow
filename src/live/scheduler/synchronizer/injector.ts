import { Synchronizer } from './synchronizer.js';
import { LiveInfo } from '../../../platform/wapper/live.js';
import { PlatformType } from '../../../platform/platform.types.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { LiveService } from '../../business/live.service.js';
import { LiveFilter } from '../filters/interface.js';
import { ChannelFinder } from '../../../channel/channel/business/channel.finder.js';
import { ChannelRecord } from '../../../channel/channel/business/channel.business.schema.js';
import { ScheduleErrorHandler } from '../error.handler.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { LiveFinder } from '../../business/live.finder.js';

export class LiveAppender extends Synchronizer {
  constructor(
    private readonly platform: PlatformType,
    private readonly fetcher: PlatformFetcher,
    private readonly liveService: LiveService,
    private readonly chFinder: ChannelFinder,
    private readonly liveFinder: LiveFinder,
    private readonly filter: LiveFilter,
    eh: ScheduleErrorHandler,
  ) {
    super(eh);
  }

  protected override async check() {
    const followedChannels = await this.chFinder.findFollowedChannels(this.platform);
    await Promise.all(followedChannels.map((ch) => this.processFollowedChannel(ch)));

    const queriedLives = await this.fetcher.fetchLives(this.platform);
    const filtered = await this.filter.getFiltered(queriedLives);
    // TODO: After changing the node domain to db-based, use Promise.all
    for (const live of filtered) {
      await this.processQueriedLive(live);
    }
    // await Promise.all(filtered.map((live) => this.processQueriedLive(live)));
  }

  private async processFollowedChannel(ch: ChannelRecord) {
    if (await this.liveFinder.findByPid(ch.pid, { withDeleted: true })) return null;
    const chanInfo = await this.fetcher.fetchChannel(this.platform, ch.pid, false);
    if (!chanInfo || !chanInfo.openLive) return null;

    const chanWithLive = await this.fetcher.fetchChannel(this.platform, ch.pid, true);
    if (!chanWithLive?.liveInfo) throw new NotFoundError('Not found Channel.liveInfo');
    await this.liveService.add(chanWithLive.liveInfo, chanWithLive);
  }

  /**
   * 스트리머가 방송을 종료해도 query 결과에는 노출될 수 있다.
   * 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있다.
   * 따라서 queried LiveInfo만이 아니라 ChannelInfo.openLive를 같이 확인하여 방송중인지 확인한 뒤 live 목록에 추가한다.
   */
  private async processQueriedLive(newInfo: LiveInfo) {
    if (await this.liveFinder.findByPid(newInfo.pid, { withDeleted: true })) return null;
    const channel = await this.fetcher.fetchChannel(this.platform, newInfo.pid, false);
    if (!channel?.openLive) return null;
    await this.liveService.add(newInfo, channel);
  }
}
