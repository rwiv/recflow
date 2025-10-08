import { Injectable } from '@nestjs/common';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../data/live.finder.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from '../register/live.registrar.js';
import { ExitCmd } from '../spec/event.schema.js';
import { handleSettled } from '../../utils/log.js';

@Injectable()
export class LiveCleaner {
  constructor(
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async cleanup() {
    const ps = [];
    for (const live of await this.liveFinder.findAll()) {
      ps.push(this.finishLive(live));
    }
    handleSettled(await Promise.allSettled(ps));
  }

  private async finishLive(live: LiveDto) {
    const channelInfo = await this.fetcher.fetchChannel(live.platform.name, live.channel.sourceId, false);
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
