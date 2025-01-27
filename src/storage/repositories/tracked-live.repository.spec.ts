import { it } from 'vitest';
import { createRedisRepo } from './test_utils.spec.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('print', async () => {
  const tracked = await createRedisRepo(env, query);
  console.log(await tracked.keys());
  console.log(await tracked.whRepo.values());
});

it('clear', async () => {
  const tracked = await createRedisRepo(env, query);
  await tracked.clear();
});
