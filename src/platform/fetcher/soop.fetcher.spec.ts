import { it } from 'vitest';
import { SoopFetcher } from './soop.fetcher.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

const channelId = '123';

it('test', async () => {
  const fetcher = new SoopFetcher(env, query);
  const res = await fetcher.fetchChannel(channelId, true);
  console.log(res);
});
