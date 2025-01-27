import { createRedisClient } from '../common/redis.js';
import { RedisMap } from '../common/map.redis.js';
import { WebhookRecord } from '../../webhook/types.js';
import {
  TRACKED_LIVE_KEYS_KEY,
  TRACKED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../redis_keys.js';
import { WebhookRepository } from './webhook.repository.js';
import { LiveInfo } from '../../platform/live.js';
import { TrackedLiveRepository } from './tracked-live-repository.service.js';
import { MemoryMap } from '../common/map.mem.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';

export async function createRedisRepo(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const whMap = new RedisMap<WebhookRecord>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const whRepo = new WebhookRepository(query, whMap);
  const trackedMap = new RedisMap<LiveInfo>(
    redis,
    TRACKED_LIVE_KEYS_KEY,
    TRACKED_LIVE_VALUE_PREFIX,
  );
  return new TrackedLiveRepository(trackedMap, whRepo);
}

export function createMemoryRepo(query: QueryConfig) {
  const whMap = new MemoryMap<string, WebhookRecord>();
  const whRepo = new WebhookRepository(query, whMap);
  const trackedMap = new MemoryMap<string, LiveInfo>();
  return new TrackedLiveRepository(trackedMap, whRepo);
}
