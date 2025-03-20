import { it } from 'vitest';
import { createTestApp } from '../../common/helpers/helper.app.js';
import { PlatformFetcher } from './fetcher.js';

const app = await createTestApp();
const fetcher = app.get(PlatformFetcher);

it('test', async () => {
  const platform = 'chzzk';
  const pid = '';
  const channelInfo = await fetcher.fetchChannel(platform, pid, true);
  console.log(channelInfo);
});
