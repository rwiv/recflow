import { Streamq } from '../client/Streamq.js';
import { readEnv } from '../common/env.js';
import { readQueryConfig } from '../common/query.js';
import { SoopLiveFilter } from './SoopLiveFilter.js';

it('test filtered', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const streamq = new Streamq(env);
  const filter = new SoopLiveFilter(streamq);

  const infos = await streamq.getSoopLive(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://play.sooplive.co.kr/${info.userId}`;
    console.log(
      `${url} - ${info.userNick} (${info.totalViewCnt}): ${info.broadTitle}`,
    );
  }
});
