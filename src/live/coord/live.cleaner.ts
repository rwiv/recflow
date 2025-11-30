import { Injectable } from '@nestjs/common';

import { handleSettled } from '@/utils/log.js';

import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveRegistrar } from '@/live/register/live.registrar.js';
import { ExitCmd } from '@/live/spec/event.schema.js';
import { LiveDto } from '@/live/spec/live.dto.schema.js';

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
