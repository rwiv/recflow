import { Streamq } from '../client/Streamq.js';
import { readEnv } from '../common/env.js';
import { readQueryConfig } from '../common/query.js';
import { ChzzkLiveFilter } from './ChzzkLiveFilter.js';

it('test filtered', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const streamq = new Streamq(env);
  const filter = new ChzzkLiveFilter(streamq);

  const infos = await streamq.getChzzkLive(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://chzzk.naver.com/live/${info.channelId}`;
    console.log(
      `${url} - ${info.channelName} (${info.concurrentUserCount}): ${info.liveTitle}`,
    );
  }
});
