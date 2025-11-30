import { Inject, Injectable } from '@nestjs/common';

import { CacheStore } from '@/infra/cache/cache.store.js';
import { SERVER_REDIS } from '@/infra/infra.tokens.js';

import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';

import { ChannelDto, channelDto } from '@/channel/spec/channel.dto.schema.js';

export const CHANNEL_KEY_PREFIX = 'channel';
export const CHANNELS_KEY_PREFIX = 'channels';
export const FOLLOWED_CHANNELS_KEY = `${CHANNELS_KEY_PREFIX}:followed`;

export interface SetOptions {
  keepEx?: boolean;
}

@Injectable()
export class ChannelCacheStore {
  constructor(@Inject(SERVER_REDIS) private readonly cache: CacheStore) {}

  async findById(id: string): Promise<ChannelDto | null> {
    const data = await this.cache.get(`${CHANNEL_KEY_PREFIX}:${id}`);
    if (!data) return null;
    return channelDto.parse(JSON.parse(data));
  }

  async findByPlatformAndSourceId(pfName: PlatformName, sourceId: string): Promise<ChannelDto | null> {
    const data = await this.cache.get(`${CHANNEL_KEY_PREFIX}:${pfName}:${sourceId}`);
    if (!data) return null;
    return channelDto.parse(JSON.parse(data));
  }

  async set(data: ChannelDto, opts: SetOptions | undefined = undefined): Promise<void> {
    const reqOpts = opts ?? {};
    const text = JSON.stringify(channelDto.parse(data));
    const p1 = this.cache.set(`${CHANNEL_KEY_PREFIX}:${data.id}`, text, reqOpts);
    const p2 = this.cache.set(this.pfUidKey(data), text, reqOpts);
    await Promise.all([p1, p2]);
  }

  async addFollowedChannel(id: string) {
    await this.cache.addItem(FOLLOWED_CHANNELS_KEY, id);
  }

  async removeFollowedChannel(id: string) {
    await this.cache.deleteItem(FOLLOWED_CHANNELS_KEY, id);
  }

  async getFollowedChannelIds(): Promise<string[]> {
    return this.cache.list(FOLLOWED_CHANNELS_KEY);
  }

  async delete(id: string) {
    const cache = await this.findById(id);
    if (cache) {
      await this.cache.delete(this.pfUidKey(cache));
    }
    await this.cache.delete(`${CHANNEL_KEY_PREFIX}:${id}`);
  }

  async deleteByDto(dto: ChannelDto) {
    await this.cache.deleteBatch([`${CHANNEL_KEY_PREFIX}:${dto.id}`, this.pfUidKey(dto)]);
  }

  private pfUidKey(data: ChannelDto) {
    return `${CHANNEL_KEY_PREFIX}:${data.platform.name}:${data.sourceId}`;
  }
}
