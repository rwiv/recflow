import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from './live.registrar.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { PlatformLiveFilter } from './live.filter.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';

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
    await Promise.all(followedChannels.map((ch) => this.registerFollowedLive(ch, cr)));

    const queriedLives = await this.fetcher.fetchLives(cr);
    const filtered = await this.filter.getFiltered(cr, queriedLives);
    for (const live of filtered) {
      await this.registerQueriedLive(live, cr);
    }
  }

  async cleanup() {
    const lives = await this.liveFinder.findAll();
    await Promise.all(lives.map((live) => this.deregisterLive(live)));
  }

  private async registerFollowedLive(ch: ChannelDto, cr: PlatformCriterionDto) {
    if (await this.liveFinder.findByPid(ch.pid, { withDisabled: true })) return null;
    const chanInfo = await this.fetcher.fetchChannel(ch.platform.name, ch.pid, false);
    if (!chanInfo || !chanInfo.openLive) return null;

    const chanWithLive = await this.fetcher.fetchChannel(ch.platform.name, ch.pid, true);
    if (!chanWithLive?.liveInfo) throw NotFoundError.from('channel.liveInfo', 'pid', ch.pid);
    await this.liveRegistrar.add(chanWithLive.liveInfo, chanWithLive, cr);
  }

  /**
   * 스트리머가 방송을 종료해도 query 결과에는 노출될 수 있다.
   * 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있다.
   * 따라서 queried LiveInfo만이 아니라 ChannelInfo.openLive를 같이 확인하여 방송중인지 확인한 뒤 live 목록에 추가한다.
   */
  private async registerQueriedLive(newInfo: LiveInfo, cr: PlatformCriterionDto) {
    if (await this.liveFinder.findByPid(newInfo.pid, { withDisabled: true })) return null;
    const channel = await this.fetcher.fetchChannel(newInfo.type, newInfo.pid, false);
    if (!channel?.openLive) return null;
    await this.liveRegistrar.add(newInfo, channel, cr);
  }

  private async deregisterLive(liveDto: LiveDto) {
    const pid = liveDto.channel.pid;
    const channel = await this.fetcher.fetchChannel(liveDto.platform.name, pid, false);
    if (channel?.openLive) return null;
    await this.liveRegistrar.delete(liveDto.id, { purge: true });
  }
}
