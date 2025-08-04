import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { GradeDto } from '../../channel/spec/grade.schema.js';
import { nnint, nonempty } from '../../common/data/common.schema.js';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { RedisStore, SetOptions } from '../../infra/redis/redis.store.js';
import { PlatformName, platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { LiveInfo } from '../../platform/spec/wapper/live.js';
export const LIVE_HISTORY_KEY_PREFIX = 'live:history';

const liveHistory = z.object({
  platform: platformNameEnum,
  liveUid: nonempty,
  title: nonempty,
  channelUid: nonempty,
  channelName: nonempty,
  gradeName: nonempty.nullable(),
  gradeTier: nnint.nullable(),
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

  async set(platform: PlatformName, liveInfo: LiveInfo, grade: GradeDto | null) {
    const history: LiveHistory = {
      platform,
      liveUid: liveInfo.liveUid,
      channelUid: liveInfo.channelUid,
      channelName: liveInfo.channelName,
      title: liveInfo.liveTitle,
      gradeName: grade?.name ?? null,
      gradeTier: grade?.tier ?? null,
      isAdult: liveInfo.isAdult,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const key = this.getKey(platform, liveInfo.liveUid);
    const data = JSON.stringify(liveHistory.parse(history));
    const opts: SetOptions = { exSec: 60 * 60 * 24 * 3 }; // 3 days
    await this.redis.set(key, data, opts);
  }

  async exists(platform: PlatformName, liveUid: string): Promise<boolean> {
    return await this.redis.exists(this.getKey(platform, liveUid));
  }

  private getKey(platform: PlatformName, liveId: string) {
    return `${LIVE_HISTORY_KEY_PREFIX}:${platform}:${liveId}`;
  }
}
