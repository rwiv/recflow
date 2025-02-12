import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveWriter } from './live.writer.js';
import { LiveFinder } from './live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { notNull } from '../../utils/null.js';

@Injectable()
export class LiveRefresher {
  constructor(
    private readonly fetcher: PlatformFetcher,
    private readonly liveWriter: LiveWriter,
    private readonly liveFinder: LiveFinder,
  ) {}

  async refreshAllLives() {
    const lives = await this.liveFinder.findAllActives();
    const liveMap = new Map<string, LiveDto>(lives.map((it) => [it.channel.pid, it]));

    const fetchPromises = lives.map(async (live) => {
      return this.fetcher.fetchChannel(live.platform.name, live.channel.pid, true);
    });
    const newChannels = (await Promise.all(fetchPromises)).filter((it) => it !== null);

    const promises = newChannels.map(async (channel) => {
      const live = notNull(liveMap.get(channel.pid));
      // 방송이 종료되었으나 cleanup cycle 이전에 refresh가 진행되면
      // record는 active이나 fetchedChannel.liveInfo는 null이 될 수 있다.
      if (!channel.liveInfo) {
        return;
      }
      await this.liveWriter.updateByLive(live.id, channel.liveInfo);
    });
    await Promise.all(promises);
  }
}
