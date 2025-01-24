import { Streamq } from '../../client/streamq.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';
import { LiveFilterChzzk } from './live-filter.chzzk.js';
import { it } from 'vitest';

it('test filtered', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const streamq = new Streamq(env);
  const filter = new LiveFilterChzzk(streamq);

  const infos = await streamq.getChzzkLive(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://chzzk.naver.com/live/${info.channelId}`;
    console.log(`${url} - ${info.channelName} (${info.concurrentUserCount}): ${info.liveTitle}`);
  }
});
