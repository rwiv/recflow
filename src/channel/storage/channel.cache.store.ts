import { Inject, Injectable } from '@nestjs/common';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { RedisStore } from '../../infra/redis/redis.store.js';
import { channelDto, ChannelDto } from '../spec/channel.dto.schema.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

export const CHANNEL_KEY_PREFIX = 'channel';
export const CHANNELS_KEY_PREFIX = 'channels';
export const FOLLOWED_CHANNELS_KEY = `${CHANNELS_KEY_PREFIX}:followed`;

export interface SetOptions {
  keepEx?: boolean;
}

@Injectable()
export class ChannelCacheStore {
  constructor(@Inject(SERVER_REDIS) private readonly redis: RedisStore) {}

  async findById(id: string): Promise<ChannelDto | null> {
    const data = await this.redis.get(`${CHANNEL_KEY_PREFIX}:${id}`);
    if (!data) return null;
    return channelDto.parse(JSON.parse(data));
  }

  async findByPlatformAndPid(pid: string, pfName: PlatformName): Promise<ChannelDto | null> {
    const data = await this.redis.get(`${CHANNEL_KEY_PREFIX}:${pfName}:${pid}`);
    if (!data) return null;
    return channelDto.parse(JSON.parse(data));
  }

  async set(data: ChannelDto, opts: SetOptions | undefined = undefined): Promise<void> {
    const reqOpts = opts ?? {};
    const text = JSON.stringify(channelDto.parse(data));
    const p1 = this.redis.set(`${CHANNEL_KEY_PREFIX}:${data.id}`, text, reqOpts);
    const p2 = this.redis.set(this.pfPidKey(data), text, reqOpts);
    await Promise.all([p1, p2]);
  }

  async addFollowedChannel(id: string) {
    await this.redis.addItem(FOLLOWED_CHANNELS_KEY, id);
  }

  async removeFollowedChannel(id: string) {
    await this.redis.deleteItem(FOLLOWED_CHANNELS_KEY, id);
  }

  async getFollowedChannelIds(): Promise<string[]> {
    return this.redis.list(FOLLOWED_CHANNELS_KEY);
  }

  async delete(id: string) {
    const cache = await this.findById(id);
    if (cache) {
      await this.redis.delete(this.pfPidKey(cache));
    }
    await this.redis.delete(`${CHANNEL_KEY_PREFIX}:${id}`);
  }

  async deleteByDto(dto: ChannelDto) {
    await this.redis.deleteBatch([`${CHANNEL_KEY_PREFIX}:${dto.id}`, this.pfPidKey(dto)]);
  }

  private pfPidKey(data: ChannelDto) {
    return `${CHANNEL_KEY_PREFIX}:${data.platform.name}:${data.pid}`;
  }
}
