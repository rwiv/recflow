import { readEnv } from '../../../common/env.js';
import { readQueryConfig } from '../../../common/query.js';
import { ChzzkLiveFilter } from './live-filter.chzzk.js';
import { it } from 'vitest';
import { ChzzkFetcher } from '../../../platform/fetcher/chzzk.fetcher.js';
import { SoopFetcher } from '../../../platform/fetcher/soop.fetcher.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { PlatformType } from '../../../platform/types.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);
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

function getFetcher() {
  const chzzkFetcher = new ChzzkFetcher(env, query);
  const soopFetcher = new SoopFetcher(env, query);
  return new PlatformFetcher(chzzkFetcher, soopFetcher);
}
