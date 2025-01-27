import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { Env } from '../common/env.js';
import { createRedisClient } from './common/redis.js';
import { RedisMap } from './common/map.redis.js';
import { WebhookRecord } from '../webhook/types.js';
import { AsyncMap } from './common/interface.js';
import { MemoryMap } from './common/map.mem.js';
import { LiveInfo } from '../platform/live.js';
import {
  DELETED_LIVE_KEYS_KEY,
  DELETED_LIVE_VALUE_PREFIX,
  TRACKED_LIVE_KEYS_KEY,
  TRACKED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from './redis_keys.js';

@Injectable()
export class StorageFactory {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {}

  async trackedLiveMap() {
    let result: AsyncMap<string, LiveInfo>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisMap<LiveInfo>(redis, TRACKED_LIVE_KEYS_KEY, TRACKED_LIVE_VALUE_PREFIX);
    } else {
      result = new MemoryMap<string, LiveInfo>();
    }
    return result;
  }

  async webhookMap() {
    let result: AsyncMap<string, WebhookRecord>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisMap<WebhookRecord>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
    } else {
      result = new MemoryMap<string, WebhookRecord>();
    }
    return result;
  }

  async deletedLiveMap() {
    let result: AsyncMap<string, LiveInfo>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisMap<LiveInfo>(redis, DELETED_LIVE_KEYS_KEY, DELETED_LIVE_VALUE_PREFIX);
    } else {
      result = new MemoryMap<string, LiveInfo>();
    }
    return result;
  }
}
