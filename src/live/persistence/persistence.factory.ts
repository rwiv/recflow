import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config.module.js';
import { Env } from '../../common/env.js';
import { createRedisClient } from '../../infra/storage/redis.js';
import { RedisMap } from '../../infra/storage/map.redis.js';
import { WebhookRecord } from '../webhook/types.js';
import { AsyncMap } from '../../infra/storage/interface.js';
import { MemoryMap } from '../../infra/storage/map.mem.js';
import {
  TRACKED_LIVE_KEYS_KEY,
  TRACKED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from './redis_keys.js';
import { TrackedRecord } from '../service/types.js';

@Injectable()
export class PersistenceFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async trackedLiveMap() {
    return createMap<TrackedRecord>(this.env, TRACKED_LIVE_KEYS_KEY, TRACKED_LIVE_VALUE_PREFIX);
  }

  async webhookMap() {
    return createMap<WebhookRecord>(this.env, WH_KEYS_KEY, WH_VALUE_PREFIX);
  }
}

async function createMap<T>(
  env: Env,
  keysKey: string,
  valuePrefix: string,
): Promise<AsyncMap<string, T>> {
  let result: AsyncMap<string, T>;
  if (['prod', 'stage'].includes(env.nodeEnv)) {
    const redis = await createRedisClient(env.redis);
    result = new RedisMap<T>(redis, keysKey, valuePrefix);
  } else {
    result = new MemoryMap<string, T>();
  }
  return result;
}
