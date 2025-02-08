import { ChzzkLiveFilter } from './live-filter.chzzk.js';
import { it } from 'vitest';
import { PlatformType } from '../../../platform/platform.types.js';
import { getFetcher } from '../../../common/helpers/platform.deps.js';
import { getConf } from '../../../common/helpers/common.js';

const [, query] = getConf();
const platform: PlatformType = 'chzzk';

it('test filtered', async () => {
  const fetcher = getFetcher();
  const filter = new ChzzkLiveFilter(query, fetcher);
  // const filter = new SoopLiveFilter(query, fetcher);

  const infos = await fetcher.fetchLives(platform);
  const filtered = await filter.getFiltered(infos);

  for (const info of filtered) {
    console.log(`${info.channelName} (${info.viewCnt}): ${info.liveTitle}`);
  }
});
