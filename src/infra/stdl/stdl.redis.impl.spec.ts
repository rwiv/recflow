import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../redis/redis.client.js';

const env = readEnv();

it('test getLivesIds', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis);
  const liveIds = await client.getLivesIds();
  console.log(liveIds);
});

it('test getSuccessSegNums', async () => {
  const liveId = '';
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis);
  const nums = await client.getSuccessSegNums(liveId);
  console.log(nums);
});
