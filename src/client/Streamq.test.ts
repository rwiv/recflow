import { Streamq } from './Streamq.js';
import { readEnv } from '../common/env.js';

const env = readEnv();
const streamq = new Streamq(env);

it('test chzzk', async () => {
  const channelId = '';
  const res2 = await streamq.getChzzkChannel(channelId, false);
  console.log(res2);
});

it('test soop channel', async () => {
  const userId = '';
  const hasLiveInfo = true;
  const res = await streamq.getSoopChannel(userId, hasLiveInfo);
  console.log(res);
});
