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
