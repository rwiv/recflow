import { it } from 'vitest';
import { SoopFetcher } from './soop.fetcher.js';
import { getConf } from '../../common/helpers.js';

const channelId = '123';

it('test', async () => {
  const fetcher = new SoopFetcher(...getConf());
  const res = await fetcher.fetchChannel(channelId, true);
  console.log(res);
});
