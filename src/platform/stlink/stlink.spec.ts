import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { Stlink } from './stlink.js';

const env = readEnv();

it('test', async () => {
  const platform = 'chzzk';
  const uid = '';
  const withCred = false;

  const stlink = new Stlink(env);
  const channelInfo = await stlink.fetchStreamInfo(platform, uid, withCred);
  console.log(channelInfo);
});
