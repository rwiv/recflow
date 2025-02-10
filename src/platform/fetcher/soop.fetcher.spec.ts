import { it } from 'vitest';
import { SoopFetcher } from './soop.fetcher.js';
import { readEnv } from '../../common/config/env.js';
import { readQueryConfig } from '../../common/config/query.js';

const channelId = '123';

it('test', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const fetcher = new SoopFetcher(env, query);
  const res = await fetcher.fetchChannel(channelId, true);
  console.log(res);
});
