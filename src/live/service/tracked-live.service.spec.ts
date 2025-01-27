import { it } from 'vitest';
import { createRedisLiveService } from './test_utils.spec.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('print', async () => {
  const liveService = await createRedisLiveService(env, query);
  console.log(await liveService.keys());
  console.log(await liveService.webhookService.values());
});

it('clear', async () => {
  const liveService = await createRedisLiveService(env, query);
  await liveService.clear();
});
