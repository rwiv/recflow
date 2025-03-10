import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveWriter } from './live.writer.js';
import { LiveFinder } from './live.finder.js';

@Injectable()
export class LiveRefresher {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
  ) {}

  async refreshEarliestOne() {
    const live = await this.liveFinder.findEarliestUpdatedOne();
    if (!live) {
      return;
    }
    const channelInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    // 방송이 종료되었으나 cleanup cycle 이전에 refresh가 진행되면
    // record는 active이지만 fetchedChannel.liveInfo는 null이 될 수 있다.
    if (!channelInfo.liveInfo) {
      return;
    }
    await this.liveWriter.updateByLive(live.id, channelInfo.liveInfo);
  }
}
