import { it } from 'vitest';
import { allKeys, createRedisClient } from './redis.js';
import { readEnv } from '../../common/env.js';

const env = readEnv();
// const pattern = '*';
const pattern = 'stdl:*';
// const pattern = 'stmgr:*';

it('test allKeys', async () => {
  const redis = await createRedisClient(env.redis);
  const res = await allKeys(redis, pattern);
  console.log(res);
});

// it('clear keys', async () => {
//   const redis = await createRedisClient(env.redis);
//   for (const key of await allKeys(redis, pattern)) {
//     await redis.del(key);
//   }
// });
