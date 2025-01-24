import { Streamq } from '../../client/streamq.js';
import { readEnv } from '../../common/env.js';
import { readQueryConfig } from '../../common/query.js';
import { LiveFilterSoop } from './live-filter.soop.js';
import { it } from 'vitest';

it('test filtered', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const streamq = new Streamq(env);
  const filter = new LiveFilterSoop(streamq);

  const infos = await streamq.getSoopLive(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://play.sooplive.co.kr/${info.userId}`;
    console.log(`${url} - ${info.userNick} (${info.totalViewCnt}): ${info.broadTitle}`);
  }
});
