import { it } from 'vitest';
import path from 'path';
import dotenv from 'dotenv';
import { createRedisClient } from './redis.client.js';
import { readRedisConfig } from '../../common/config/env.utils.js';
import { allKeys } from './redis.utils.js';

dotenv.config({ path: path.resolve('dev', '.env') });
const conf = readRedisConfig();

const pattern = '*';
// const pattern = 'stmgr:*';
const targetKey = '';

it('test get', async () => {
  const redis = await createRedisClient(conf);
  const value = await redis.get(targetKey);
  if (value) {
    console.log(JSON.parse(value));
  }
});

it('test allKeys', async () => {
  const redis = await createRedisClient(conf);
  const res = await allKeys(redis, pattern);
  console.log(res);
});

// it('clear keys', async () => {
//   const redis = await createRedisClient(env.redis);
//   for (const key of await allKeys(redis, pattern)) {
//     await redis.del(key);
//   }
// });
