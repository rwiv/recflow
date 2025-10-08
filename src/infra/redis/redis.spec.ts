import { describe, it, beforeAll } from 'vitest';
import { RedisClientType } from 'redis';
import { createRedisClient } from './redis.client.js';
import { allKeys } from './redis.utils.js';
import { readEnv } from '../../common/config/env.js';

describe.skip('redis', () => {
  let redis: RedisClientType;

  beforeAll(async () => {
    const env = readEnv();
    redis = await createRedisClient(env.stdlRedisMaster);
  });

  const pattern = '*';
  // const pattern = 'stmgr:*';
  const targetKey = '';

  it('get', async () => {
    const value = await redis.get(targetKey);
    if (value) {
      console.log(JSON.parse(value));
    }
  });

  it('allKeys', async () => {
    const res = await allKeys(redis, pattern);
    console.log(res);
  });

  // it('keys', async () => {
  //   for (const key of await allKeys(redis, pattern)) {
  //     await redis.del(key);
  //   }
  // });
});
