import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';
import { it } from 'vitest';
import { createRedisRepo } from './factory.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('test synchronize', async () => {
  const targeted = await createRedisRepo(env, query);
  const lives = await targeted.all();
  await targeted.whRepo.synchronize(lives);
});
