import { createRedisClient } from '../../infra/storage/redis.js';
import { RedisMap } from '../../infra/storage/map.redis.js';
import { NodeRecord } from '../../node/types.js';
import {
  LIVE_KEYS_KEY,
  LIVE_VALUE_PREFIX,
  WH_KEYS_KEY,
  WH_VALUE_PREFIX,
} from '../persistence/redis_keys.js';
import { NodeService } from './node.service.js';
import { TrackedLiveService } from './tracked-live.service.js';
import { MemoryMap } from '../../infra/storage/map.mem.js';
import { Env } from '../../common/config/env.js';
import { QueryConfig } from '../../common/config/query.js';
import { LiveRecord } from './types.js';
import { createLiveEventListener } from '../event/test_utils.spec.js';
import { getFetcher } from '../../common/helpers/platform.deps.js';
import { NodeSelector } from '../../node/node.selector.js';
import { ChannelPriorityEvaluator } from '../../channel/priority/priority.evaluator.js';

export async function createRedisLiveService(env: Env, query: QueryConfig) {
  const redis = await createRedisClient(env.redis);
  const nodeMap = new RedisMap<NodeRecord>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const nodeService = new NodeService(query, nodeMap);
  const liveMap = new RedisMap<LiveRecord>(redis, LIVE_KEYS_KEY, LIVE_VALUE_PREFIX);
  const fetcher = getFetcher();
  const listener = createLiveEventListener(env, query);
  const nodeSelector = new NodeSelector(new ChannelPriorityEvaluator(query));
  return new TrackedLiveService(liveMap, fetcher, listener, nodeService, nodeSelector);
}

export function createMemoryLiveService(env: Env, query: QueryConfig) {
  const nodeMap = new MemoryMap<string, NodeRecord>();
  const nodeService = new NodeService(query, nodeMap);
  const liveMap = new MemoryMap<string, LiveRecord>();
  const fetcher = getFetcher();
  const listener = createLiveEventListener(env, query);
  const nodeSelector = new NodeSelector(new ChannelPriorityEvaluator(query));
  return new TrackedLiveService(liveMap, fetcher, listener, nodeService, nodeSelector);
}
