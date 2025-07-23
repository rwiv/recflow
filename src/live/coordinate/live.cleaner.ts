import { Injectable } from '@nestjs/common';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../data/live.finder.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from '../register/live.registrar.js';
import { ExitCmd } from '../spec/event.schema.js';

@Injectable()
export class LiveCleaner {
  constructor(
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async cleanup() {
    const promises = [];
    for (const live of await this.liveFinder.findAll()) {
      promises.push(this.finishLive(live));
    }
    await Promise.allSettled(promises);
  }

  private async finishLive(live: LiveDto) {
    const channelInfo = await this.fetcher.fetchChannel(live.platform.name, live.channel.pid, false);
    if (channelInfo?.openLive) {
      return;
    }
    let exitCmd: ExitCmd = 'finish';
    if (live.isDisabled) {
      exitCmd = 'delete';
    }
    await this.liveRegistrar.finishLive({ recordId: live.id, isPurge: true, exitCmd });
  }
}
