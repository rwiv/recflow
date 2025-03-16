import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from './live.registrar.js';
import { ChannelFinder } from '../../channel/service/channel.finder.js';
import { ChannelDto } from '../../channel/spec/channel.dto.schema.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { PlatformLiveFilter } from './live.filter.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { channelLiveInfo, ChannelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { LiveWriter } from '../access/live.writer.js';

@Injectable()
export class LiveCoordinator {
  constructor(
    private readonly channelFinder: ChannelFinder,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveWriter: LiveWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly filter: PlatformLiveFilter,
  ) {}

  async registerQueriedLives(cr: PlatformCriterionDto) {
    const followedChannels = await this.channelFinder.findFollowedChannels(cr.platform.name);
    for (const channel of followedChannels) {
      await this.registerFollowedLive(channel, cr);
    }

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

  private async registerFollowedLive(ch: ChannelDto, cr: PlatformCriterionDto, tx: Tx = db) {
    const clInfo = await this.fetchInfo(ch.platform.name, ch.pid, tx);
    if (!clInfo) return;
    await this.liveRegistrar.add(clInfo, cr);
  }

  private async registerQueriedLive(newInfo: LiveInfo, cr: PlatformCriterionDto, tx: Tx = db) {
    const clInfo = await this.fetchInfo(newInfo.type, newInfo.pid, tx);
    if (!clInfo) return;
    await this.liveRegistrar.add(clInfo, cr);
  }

  private async fetchInfo(pfName: PlatformName, pid: string, tx: Tx = db): Promise<ChannelLiveInfo | null> {
    if (await this.liveFinder.findByPid(pid, tx, { withDisabled: true })) return null;

    const chanInfo = await this.fetcher.fetchChannel(pfName, pid, false, false);
    if (!chanInfo?.openLive) return null;

    const chanWithLive = await this.fetcher.fetchChannel(pfName, pid, true, false);
    if (!chanWithLive?.liveInfo) return null;

    return channelLiveInfo.parse(chanWithLive);
  }

  private async deregisterLive(liveDto: LiveDto) {
    const pid = liveDto.channel.pid;
    const channel = await this.fetcher.fetchChannel(liveDto.platform.name, pid, false);
    if (channel?.openLive) return null;
    await this.liveWriter.delete(liveDto.id);
  }
}
