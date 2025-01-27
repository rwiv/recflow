import { createRedisClient } from '../common/redis.js';
import { RedisMap } from '../common/map.redis.js';
import { WebhookState } from '../../webhook/types.js';
import {
  TRACKED_LIVE_KEYS_KEY,
  TRACKED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../redis_keys.js';
import { WebhookStateRepository } from './webhook-state.repository.js';
import { LiveInfo } from '../../platform/live.js';
import { TrackedLiveRepository } from './tracked-live-repository.service.js';
import { MemoryMap } from '../common/map.mem.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';

export async function createRedisRepo(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const whMap = new RedisMap<WebhookState>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const whRepo = new WebhookStateRepository(query, whMap);
  const targetMap = new RedisMap<LiveInfo>(redis, TRACKED_LIVE_KEYS_KEY, TRACKED_LIVE_VALUE_PREFIX);
  return new TrackedLiveRepository(targetMap, whRepo);
}

export function createMemoryRepo(query: QueryConfig) {
  const whMap = new MemoryMap<string, WebhookState>();
  const whRepo = new WebhookStateRepository(query, whMap);
  const targetMap = new MemoryMap<string, LiveInfo>();
  return new TrackedLiveRepository(targetMap, whRepo);
}
