import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { Env } from '../common/env.js';
import { createRedisClient } from './common/redis.js';
import { RedisMap } from './common/map.redis.js';
import { WebhookState } from '../webhook/types.js';
import {AsyncMap, AsyncSet} from './common/interface.js';
import { MemoryMap } from './common/map.mem.js';
import { LiveInfo } from '../platform/live.js';
import {RedisSet} from "./common/set.redis.js";
import {MemorySet} from "./common/set.mem.js";
import {
  DELETED_LIVE_KEY,
  TARGETED_LIVE_KEYS_KEY,
  TARGETED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX
} from "./redis_keys.js";

@Injectable()
export class StorageFactory {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {}

  async targetedLiveMap() {
    let result: AsyncMap<string, LiveInfo>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisMap<LiveInfo>(redis, TARGETED_LIVE_KEYS_KEY, TARGETED_LIVE_VALUE_PREFIX);
    } else {
      result = new MemoryMap<string, LiveInfo>();
    }
    return result;
  }

  async webhookMap() {
    let result: AsyncMap<string, WebhookState>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisMap<WebhookState>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
    } else {
      result = new MemoryMap<string, WebhookState>();
    }
    return result;
  }

  async deletedLiveSet() {
    let result: AsyncSet<string>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisSet<string>(redis, DELETED_LIVE_KEY);
    } else {
      result = new MemorySet<string>();
    }
    return result;
  }
}
