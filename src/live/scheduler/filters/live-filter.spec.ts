import { ChzzkLiveFilter } from './live-filter.chzzk.js';
import { it } from 'vitest';
import { PlatformType } from '../../../platform/types.js';
import { getFetcher } from '../../helpers/utils.js';
import { getConf } from '../../../common/helpers.js';

const [, query] = getConf();
const ptype: PlatformType = 'chzzk';

it('test filtered', async () => {
  const fetcher = getFetcher();
  const filter = new ChzzkLiveFilter(query, fetcher);
  // const filter = new SoopLiveFilter(query, fetcher);

  const infos = await fetcher.fetchLives(ptype);
  const filtered = await filter.getFiltered(infos);

  for (const info of filtered) {
    console.log(`${info.channelName} (${info.viewCnt}): ${info.liveTitle}`);
  }
});
