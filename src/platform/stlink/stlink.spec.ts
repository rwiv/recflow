import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { Stlink } from './stlink.js';

const env = readEnv();

it('test', async () => {
  const platform = 'chzzk';
  const uid = '';
  const withAuth = false;

  const stlink = new Stlink(env);
  const stream = await stlink.fetchStreamInfo(platform, uid, withAuth);
  const streamUrl = stream.best?.mediaPlaylistUrl;
  if (!streamUrl) {
    throw new Error('Stream URL not found');
  }
  const headers = stream.headers;
  if (!headers) {
    throw new Error('Headers not found');
  }
  const m3u8 = await stlink.fetchM3u8({ url: streamUrl, headers: headers, params: null });
  console.log(m3u8);
});
