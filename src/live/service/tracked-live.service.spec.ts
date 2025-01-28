import { it } from 'vitest';
import { createRedisLiveService } from './test_utils.spec.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('print', async () => {
  const liveService = await createRedisLiveService(env, query);
  console.log(await liveService.keys());
  console.log(await liveService.webhooks());
});

it('sync webhooks', async () => {
  const liveService = await createRedisLiveService(env, query);
  await liveService.syncWebhooks();
});

// it('clear', async () => {
//   const liveService = await createRedisLiveService(env, query);
//   await liveService.clear();
// });
