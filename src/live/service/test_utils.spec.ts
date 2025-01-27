import { createRedisClient } from '../../infra/storage/redis.js';
import { RedisMap } from '../../infra/storage/map.redis.js';
import { WebhookRecord } from '../webhook/types.js';
import {
  TRACKED_LIVE_KEYS_KEY,
  TRACKED_LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../persistence/redis_keys.js';
import { WebhookService } from './webhook.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { MemoryMap } from '../../infra/storage/map.mem.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';
import { createFetcher } from '../../platform/utils/test_utils.spec.js';
import { TrackedRecord } from './types.js';

export async function createRedisTrackedService(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const whMap = new RedisMap<WebhookRecord>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const whService = new WebhookService(query, whMap);
  const trackedMap = new RedisMap<TrackedRecord>(
    redis,
    TRACKED_LIVE_KEYS_KEY,
    TRACKED_LIVE_VALUE_PREFIX,
  );
  const fetcher = createFetcher(env, query);
  return new TrackedLiveService(trackedMap, fetcher, whService);
}

export function createMemoryTrackedService(env: Env, query: QueryConfig) {
  const whMap = new MemoryMap<string, WebhookRecord>();
  const whService = new WebhookService(query, whMap);
  const trackedMap = new MemoryMap<string, TrackedRecord>();
  const fetcher = createFetcher(env, query);
  return new TrackedLiveService(trackedMap, whService, fetcher);
}
