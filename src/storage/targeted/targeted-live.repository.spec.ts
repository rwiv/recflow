import { it } from 'vitest';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';
import { WebhookStateRepository } from '../webhook/webhook-state.repository.js';
import { createRedisClient } from '../common/redis.js';
import { RedisMap } from '../common/map.redis.js';
import { WH_KEYS_KEY, WH_VALUE_PREFIX } from '../webhook/consts.js';
import { TargetedLiveRepository } from './targeted-live.repository.js';
import { LiveInfo } from '../../platform/live.js';
import { TARGET_KEYS_KEY, TARGET_VALUE_PREFIX } from './consts.js';
import { MemoryMap } from '../common/map.mem.js';
import { WebhookState } from '../../webhook/types.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('print', async () => {
  // const targetRepo = createMemoryRepo();
  const targetRepo = await createRedisRepo();
  console.log(await targetRepo.keys());
  console.log(await targetRepo.whRepo.values());
  const chzzk = await targetRepo.allChzzk();
  console.log(chzzk.map((info) => info.channelName));
  const soop = await targetRepo.allSoop();
  console.log(soop.map((info) => info.channelName));
});

it('clear', async () => {
  // const targetRepo = createMemoryRepo();
  const targetRepo = await createRedisRepo();
  await targetRepo.clear();
});

async function createRedisRepo() {
  const redis = await createRedisClient(env.redis);
  const whMap = new RedisMap<WebhookState>(redis, WH_KEYS_KEY, WH_VALUE_PREFIX);
  const whcRepo = new WebhookStateRepository(query, whMap);
  const targetMap = new RedisMap<LiveInfo>(redis, TARGET_KEYS_KEY, TARGET_VALUE_PREFIX);
  return new TargetedLiveRepository(targetMap, whcRepo);
}

function createMemoryRepo() {
  const whMap = new MemoryMap<string, WebhookState>();
  const whcRepo = new WebhookStateRepository(query, whMap);
  const targetMap = new MemoryMap<string, LiveInfo>();
  return new TargetedLiveRepository(targetMap, whcRepo);
}
