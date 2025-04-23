import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../access/live.finder.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveRegistrar } from './live.registrar.js';

@Injectable()
export class LiveCleaner {
  constructor(
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async cleanup(tx: Tx = db) {
    for (const live of await this.liveFinder.findAll()) {
      await this.deregisterLive(live, tx);
    }
  }

  private async deregisterLive(live: LiveDto, tx: Tx = db) {
    const channelInfo = await this.fetcher.fetchChannel(live.platform.name, live.channel.pid, false);
    if (channelInfo?.openLive) {
      return null;
    }
    await this.liveRegistrar.deregister(live.id, {}, tx);
  }
}
