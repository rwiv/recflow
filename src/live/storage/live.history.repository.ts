import { Inject, Injectable } from '@nestjs/common';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { RedisStore, SetOptions } from '../../infra/redis/redis.store.js';
import { PlatformName, platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { z } from 'zod';
import { nonempty } from '../../common/data/common.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';

export const LIVE_HISTORY_KEY_PREFIX = 'live:history';

const liveHistory = z.object({
  platform: platformNameEnum,
  liveId: nonempty,
  channelId: nonempty,
  channelName: nonempty,
  title: nonempty,
  isAdult: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type LiveHistory = z.infer<typeof liveHistory>;

@Injectable()
export class LiveHistoryRepository {
  constructor(@Inject(SERVER_REDIS) private readonly redis: RedisStore) {}

  async get(platform: PlatformName, liveId: string) {
    const data = await this.redis.get(this.getKey(platform, liveId));
    if (!data) return null;
    return liveHistory.parse(JSON.parse(data));
  }

  async set(platform: PlatformName, liveInfo: LiveInfo) {
    const history: LiveHistory = {
      platform,
      liveId: liveInfo.liveId,
      channelId: liveInfo.pid,
      channelName: liveInfo.channelName,
      title: liveInfo.liveTitle,
      isAdult: liveInfo.isAdult,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const key = this.getKey(platform, liveInfo.liveId);
    const data = JSON.stringify(liveHistory.parse(history));
    const opts: SetOptions = { exSec: 60 * 60 * 24 * 7 }; // 7 days
    await this.redis.set(key, data, opts);
  }

  async exists(platform: PlatformName, liveId: string): Promise<boolean> {
    return await this.redis.exists(this.getKey(platform, liveId));
  }

  private getKey(platform: PlatformName, liveId: string) {
    return `${LIVE_HISTORY_KEY_PREFIX}:${platform}:${liveId}`;
  }
}
