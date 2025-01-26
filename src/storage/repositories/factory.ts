import { createRedisClient } from '../common/redis.js';
import { RedisMap } from '../common/map.redis.js';
import { WebhookState } from '../../webhook/types.js';
import {
  TARGETED_LIVE_KEYS_KEY,
  TARGETED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../redis_keys.js';
import { WebhookStateRepository } from './webhook-state.repository.js';
import { LiveInfo } from '../../platform/live.js';
import { TargetedLiveRepository } from './targeted-live.repository.js';
import { MemoryMap } from '../common/map.mem.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';

export async function createRedisRepo(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const whMap = new RedisMap<WebhookState>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const whRepo = new WebhookStateRepository(query, whMap);
  const targetMap = new RedisMap<LiveInfo>(
    redis,
    TARGETED_LIVE_KEYS_KEY,
    TARGETED_LIVE_VALUE_PREFIX,
  );
  return new TargetedLiveRepository(targetMap, whRepo);
}

export function createMemoryRepo(query: QueryConfig) {
  const whMap = new MemoryMap<string, WebhookState>();
  const whRepo = new WebhookStateRepository(query, whMap);
  const targetMap = new MemoryMap<string, LiveInfo>();
  return new TargetedLiveRepository(targetMap, whRepo);
}
