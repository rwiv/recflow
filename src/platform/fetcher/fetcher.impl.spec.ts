import { it } from 'vitest';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { ChzzkFetcher } from './platforms/fetcher.chzzk.js';
import { SoopFetcher } from './platforms/fetcher.soop.js';
import { PlatformFetcherImpl } from './fetcher.impl.js';

it.skip('test PlatformFetcher', async () => {
  const app = await createTestApp();
  const fetcher = new PlatformFetcherImpl(app.get(ChzzkFetcher), app.get(SoopFetcher));

  const platform = 'chzzk';
  const sourceId = '';
  const channelInfo = await fetcher.fetchChannel(platform, sourceId, true);
  console.log(channelInfo);
});
