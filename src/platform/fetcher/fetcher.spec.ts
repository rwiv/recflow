import { it } from 'vitest';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { PlatformFetcher } from './fetcher.js';

const app = await createTestApp();
const fetcher = app.get(PlatformFetcher);

it('test', async () => {
  const platform = 'chzzk';
  const sourceId = '';
  const channelInfo = await fetcher.fetchChannel(platform, sourceId, true);
  console.log(channelInfo);
});
