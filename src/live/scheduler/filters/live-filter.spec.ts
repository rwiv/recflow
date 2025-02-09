import { ChzzkLiveFilter } from './live-filter.chzzk.js';
import { it } from 'vitest';
import { PlatformType } from '../../../platform/platform.types.js';
import { createTestApp } from '../../../common/helpers/helper.app.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';

const app = await createTestApp();
const fetcher = app.get(PlatformFetcher);
const filter = app.get(ChzzkLiveFilter);
// const filter = app.get(SoopLiveFilter);

const platform: PlatformType = 'chzzk';

it('test filtered', async () => {
  const infos = await fetcher.fetchLives(platform);
  const filtered = await filter.getFiltered(infos);

  for (const info of filtered) {
    console.log(`${info.channelName} (${info.viewCnt}): ${info.liveTitle}`);
  }
});
