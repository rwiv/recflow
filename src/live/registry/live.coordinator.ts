import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from './live.registrar.js';
import { LiveFilter } from './filters/interface.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveFinder } from '../access/live.finder.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { LiveDto } from '../spec/live.dto.schema.js';

@Injectable()
export class LiveCoordinator {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly registrar: LiveRegistrar,
    private readonly chFinder: ChannelFinder,
    private readonly liveFinder: LiveFinder,
    private readonly filter: LiveFilter,
  ) {}

  async registerQueriedLives(platformName: PlatformName) {
    const followedChannels = await this.chFinder.findFollowedChannels(platformName);
    await Promise.all(followedChannels.map((ch) => this.registerFollowedLive(ch)));

    const queriedLives = await this.fetcher.fetchLives(platformName);
    const filtered = await this.filter.getFiltered(queriedLives);
    for (const live of filtered) {
      await this.registerQueriedLive(live);
    }
  }

  async cleanup(platformName: PlatformName) {
    const all = await this.liveFinder.findAll();
    const lives = all.filter((live) => live.platform.name === platformName);
    await Promise.all(lives.map((live) => this.deregisterLive(live)));
  }

  private async registerFollowedLive(ch: ChannelDto) {
    if (await this.liveFinder.findByPid(ch.pid, { withDeleted: true })) return null;
    const chanInfo = await this.fetcher.fetchChannel(ch.platform.name, ch.pid, false);
    if (!chanInfo || !chanInfo.openLive) return null;

    const chanWithLive = await this.fetcher.fetchChannel(ch.platform.name, ch.pid, true);
    if (!chanWithLive?.liveInfo) throw NotFoundError.from('channel.liveInfo', 'pid', ch.pid);
    await this.registrar.add(chanWithLive.liveInfo, chanWithLive);
  }

  /**
   * 스트리머가 방송을 종료해도 query 결과에는 노출될 수 있다.
   * 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있다.
   * 따라서 queried LiveInfo만이 아니라 ChannelInfo.openLive를 같이 확인하여 방송중인지 확인한 뒤 live 목록에 추가한다.
   */
  private async registerQueriedLive(newInfo: LiveInfo) {
    if (await this.liveFinder.findByPid(newInfo.pid, { withDeleted: true })) return null;
    const channel = await this.fetcher.fetchChannel(newInfo.type, newInfo.pid, false);
    if (!channel?.openLive) return null;
    await this.registrar.add(newInfo, channel);
  }

  private async deregisterLive(liveDto: LiveDto) {
    const pid = liveDto.channel.pid;
    const channel = await this.fetcher.fetchChannel(liveDto.platform.name, pid, false);
    if (channel?.openLive) return null;
    await this.registrar.delete(liveDto.id, { purge: true });
  }
}
