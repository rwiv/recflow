import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveWriter } from './live.writer.js';
import { FindOptions, LiveFinder } from './live.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';

@Injectable()
export class LiveRefresher {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
  ) {}

  async refreshEarliestOne(tx: Tx = db) {
    const live = await this.liveFinder.findEarliestUpdatedOne(tx);
    if (!live) return;

    const chanInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    // 방송이 종료되었으나 cleanup cycle 이전에 refresh가 진행되면 record는 active이지만 fetchedChannel.liveInfo는 null이 될 수 있다.
    if (!chanInfo.liveInfo) return;

    return tx.transaction(async (txx) => {
      const opts: FindOptions = { includeDisabled: true, forUpdate: true };
      const queried = await this.liveFinder.findById(live.id, opts, txx);
      if (!queried) return;
      await this.liveWriter.updateByLive(live.id, channelLiveInfo.parse(chanInfo).liveInfo, txx);
    });
  }
}
