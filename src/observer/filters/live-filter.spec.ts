import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';
import { ChzzkLiveFilter } from './live-filter.chzzk.js';
import { it } from 'vitest';
import { ChzzkFetcher } from '../../platform/chzzk.fetcher.js';
import { SoopFetcher } from '../../platform/soop.fetcher.js';
import { SoopLiveFilter } from './live-filter.soop.js';

const env = readEnv();
const query = readQueryConfig(env.configPath);

it('test filtered', async () => {
  const [fetcher, filter] = chzzkLiveFilter();
  // const [fetcher, filter] = soopLiveFilter();

  const infos = await fetcher.fetchLives();
  const filtered = await filter.getFiltered(infos);

  for (const info of filtered) {
    console.log(`${info.channelName} (${info.viewCnt}): ${info.liveTitle}`);
  }
});

function chzzkLiveFilter(): [ChzzkFetcher, ChzzkLiveFilter] {
  const fetcher = new ChzzkFetcher(env, query);
  return [fetcher, new ChzzkLiveFilter(fetcher, query)];
}

function soopLiveFilter(): [SoopFetcher, SoopLiveFilter] {
  const fetcher = new SoopFetcher(env, query);
  return [fetcher, new SoopLiveFilter(fetcher, query)];
}
