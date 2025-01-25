import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { Env } from '../common/env.js';
import { createRedisClient } from './common/redis.js';
import { RedisMap } from './common/map.redis.js';
import { WebhookState } from '../webhook/types.js';
import { WH_KEYS_KEY, WH_VALUE_PREFIX } from './webhook/consts.js';
import { AsyncMap } from './common/interface.js';
import { MemoryMap } from './common/map.mem.js';
import { LiveInfo } from '../platform/live.js';
import { TARGET_KEYS_KEY, TARGET_VALUE_PREFIX } from './targeted/consts.js';

@Injectable()
export class StorageFactory {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {}

  async targetMap() {
    let result: AsyncMap<string, LiveInfo>;
    if (['prod', 'stage'].includes(this.env.nodeEnv)) {
      const redis = await createRedisClient(this.env.redis);
      result = new RedisMap<LiveInfo>(redis, TARGET_KEYS_KEY, TARGET_VALUE_PREFIX);
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
}
