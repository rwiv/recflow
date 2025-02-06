import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config.module.js';
import { Env } from '../../common/env.js';
import { createRedisClient } from '../../infra/storage/redis.js';
import { RedisMap } from '../../infra/storage/map.redis.js';
import { NodeRecord } from '../../node/types.js';
import { AsyncMap } from '../../infra/storage/interface.js';
import { MemoryMap } from '../../infra/storage/map.mem.js';
import { LIVE_KEYS_KEY, LIVE_VALUE_PREFIX, WH_KEYS_KEY, WH_VALUE_PREFIX } from './redis_keys.js';
import { LiveRecord } from '../business/types.js';

@Injectable()
export class PersistenceFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async liveMap() {
    return createMap<LiveRecord>(this.env, LIVE_KEYS_KEY, LIVE_VALUE_PREFIX);
  }

  async nodeMap() {
    return createMap<NodeRecord>(this.env, WH_KEYS_KEY, WH_VALUE_PREFIX);
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
