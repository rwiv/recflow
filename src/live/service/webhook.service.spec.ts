import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';
import { it } from 'vitest';
import { createRedisLiveService } from './test_utils.spec.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('test synchronize', async () => {
  const liveService = await createRedisLiveService(env, query);
  const lives = await liveService.findAllActives();
  await liveService.webhookService.synchronize(lives);
});
