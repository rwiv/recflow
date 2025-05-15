import { Injectable } from '@nestjs/common';
import { ChannelCacheStore } from '../storage/channel.cache.store.js';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { isEqualSet } from '../../utils/set.js';
import { log } from 'jslog';

@Injectable()
export class ChannelCacheChecker {
  constructor(
    private readonly cache: ChannelCacheStore,
    private readonly query: ChannelQueryRepository,
  ) {}

  async checkCache() {
    const cachedIds = await this.cache.getFollowedChannelIds();
    const recordedIds = await this.query.findIdsByFollowedFlag(true);

    if (!isEqualSet(new Set<string>(cachedIds), new Set(recordedIds))) {
      log.error('Cache and DB are inconsistent');
      await Promise.all(cachedIds.map((id) => this.cache.removeFollowedChannel(id)));
      await Promise.all(recordedIds.map((id) => this.cache.addFollowedChannel(id)));
    }
  }
}
