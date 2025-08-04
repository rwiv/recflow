import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { liveAttr } from '../../common/attr/attr.live.js';
import { db } from '../../infra/db/db.js';
import { Tx } from '../../infra/db/types.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveFinder } from './live.finder.js';
import { LiveWriter } from './live.writer.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class LiveRefresher {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
  ) {}

  async refreshEarliestOne(tx: Tx = db) {
    const live = await this.liveFinder.findEarliestUpdatedOne(tx);
    if (!live) return; // db에 라이브가 하나도 존재하지 않는 경우

    const channelInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.sourceId, true);
    const liveInfo = channelInfo?.liveInfo;
    // 방송이 종료되었으나 cleanup cycle 이전에 refresh가 진행되면 record는 active이지만 fetchedChannel.liveInfo는 null이 될 수 있다.
    if (!liveInfo) return;

    return tx.transaction(async (txx) => {
      const before = await this.liveFinder.findById(live.id, { forUpdate: true }, txx);
      if (!before) return;

      await this.liveWriter.updateByLive(live.id, liveInfo, txx);

      const updated = await this.liveFinder.findById(live.id, {}, txx);
      if (!updated) throw NotFoundError.from('Live', 'id', live.id);
      if (before.liveTitle !== updated.liveTitle) {
        log.info('Live Title Changed', liveAttr(updated));
      }
    });
  }
}
