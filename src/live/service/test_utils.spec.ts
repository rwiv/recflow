import { createRedisClient } from '../../infra/storage/redis.js';
import { RedisMap } from '../../infra/storage/map.redis.js';
import { WebhookRecord } from '../webhook/types.js';
import {
  LIVE_KEYS_KEY,
  LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../persistence/redis_keys.js';
import { WebhookService } from './webhook.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { MemoryMap } from '../../infra/storage/map.mem.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';
import { createFetcher } from '../../platform/utils/test_utils.spec.js';
import { LiveRecord } from './types.js';
import { createLiveEventListener } from '../event/test_utils.spec.js';
import { PlatformWebhookMatcher } from './webhook.matcher.js';
import { WebhookMatcherChzzkMode1 } from '../webhook/chzzk/webhook-matcher.chzzk.mode1.js';
import { WebhookMatcherSoopMode1 } from '../webhook/soop/webhook-matcher.soop.mode1.js';

export async function createRedisLiveService(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const webhookMap = new RedisMap<WebhookRecord>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const webhookService = new WebhookService(query, webhookMap);
  const liveMap = new RedisMap<LiveRecord>(redis, LIVE_KEYS_KEY, LIVE_VALUE_PREFIX);
  const fetcher = createFetcher(env, query);
  const listener = createLiveEventListener(env, query);
  const webhookMatcher = new PlatformWebhookMatcher(
    new WebhookMatcherChzzkMode1(query),
    new WebhookMatcherSoopMode1(query),
  );
  return new TrackedLiveService(liveMap, fetcher, listener, webhookService, webhookMatcher);
}

export function createMemoryLiveService(env: Env, query: QueryConfig) {
  const webhookMap = new MemoryMap<string, WebhookRecord>();
  const webhookService = new WebhookService(query, webhookMap);
  const liveMap = new MemoryMap<string, LiveRecord>();
  const fetcher = createFetcher(env, query);
  const listener = createLiveEventListener(env, query);
  const webhookMatcher = new PlatformWebhookMatcher(
    new WebhookMatcherChzzkMode1(query),
    new WebhookMatcherSoopMode1(query),
  );
  return new TrackedLiveService(liveMap, fetcher, listener, webhookService, webhookMatcher);
}
