import { readEnv } from '../common/env.js';
import { readQueryConfig } from '../common/query.js';
import { it } from 'vitest';
import { createRedisRepo } from './test_utils.spec.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('test synchronize', async () => {
  const tracked = await createRedisRepo(env, query);
  const records = await tracked.findAllActives();
  await tracked.whRepo.synchronize(records);
});
