import { createRedisClient } from '../../infra/storage/redis.js';
import { RedisMap } from '../../infra/storage/map.redis.js';
import { NodeRecord } from '../node/types.js';
import {
  LIVE_KEYS_KEY,
  LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../persistence/redis_keys.js';
import { NodeService } from './node.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { MemoryMap } from '../../infra/storage/map.mem.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';
import { createFetcher } from '../../platform/utils/test_utils.spec.js';
import { LiveRecord } from './types.js';
import { createLiveEventListener } from '../event/test_utils.spec.js';
import { PlatformNodeSelector } from './node.selector.js';
import { ChzzkNodeSelectorMode1 } from '../node/selector/chzzk/selector.chzzk.mode1.js';
import { SoopNodeSelectorMode1 } from '../node/selector/soop/selector.soop.mode1.js';

export async function createRedisLiveService(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const webhookMap = new RedisMap<NodeRecord>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const webhookService = new NodeService(query, webhookMap);
  const liveMap = new RedisMap<LiveRecord>(redis, LIVE_KEYS_KEY, LIVE_VALUE_PREFIX);
  const fetcher = createFetcher(env, query);
  const listener = createLiveEventListener(env, query);
  const webhookMatcher = new PlatformNodeSelector(
    new ChzzkNodeSelectorMode1(query),
    new SoopNodeSelectorMode1(query),
  );
  return new TrackedLiveService(liveMap, fetcher, listener, webhookService, webhookMatcher);
}

export function createMemoryLiveService(env: Env, query: QueryConfig) {
  const webhookMap = new MemoryMap<string, NodeRecord>();
  const webhookService = new NodeService(query, webhookMap);
  const liveMap = new MemoryMap<string, LiveRecord>();
  const fetcher = createFetcher(env, query);
  const listener = createLiveEventListener(env, query);
  const webhookMatcher = new PlatformNodeSelector(
    new ChzzkNodeSelectorMode1(query),
    new SoopNodeSelectorMode1(query),
  );
  return new TrackedLiveService(liveMap, fetcher, listener, webhookService, webhookMatcher);
}
