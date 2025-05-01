import { Injectable } from '@nestjs/common';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../data/live.finder.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from './live.registrar.js';

@Injectable()
export class LiveCleaner {
  constructor(
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async cleanup() {
    for (const live of await this.liveFinder.findAll()) {
      await this.deregisterLive(live);
    }
  }

  private async deregisterLive(live: LiveDto) {
    const channelInfo = await this.fetcher.fetchChannel(live.platform.name, live.channel.pid, false);
    if (channelInfo?.openLive) {
      return;
    }
    await this.liveRegistrar.finishLive(live.id, { isPurge: true, exitCmd: 'finish' });
  }
}
