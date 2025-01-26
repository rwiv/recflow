import { it } from 'vitest';
import { createRedisRepo } from './factory.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('print', async () => {
  // const targetRepo = createMemoryRepo(query);
  const targeted = await createRedisRepo(env, query);
  console.log(await targeted.keys());
  console.log(await targeted.whRepo.values());
});

it('clear', async () => {
  // const targetRepo = createMemoryRepo(query);
  const targeted = await createRedisRepo(env, query);
  await targeted.clear();
});
