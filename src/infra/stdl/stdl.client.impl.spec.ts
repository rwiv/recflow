import { it } from 'vitest';
import { StdlImpl } from './stdl.client.impl.js';
import { readEnv } from '../../common/config/env.js';
import { AuthedImpl } from '../authed/authed.impl.js';

const stdlUrl = '';
const platform = 'chzzk';
const uid = '';

it('test getStatus', async () => {
  const env = readEnv();
  const authed = new AuthedImpl(env);
  const stdl = new StdlImpl(authed);
  const status = await stdl.getStatus(stdlUrl);
  console.log(status);
});

it('test cancel', async () => {
  const env = readEnv();
  const authed = new AuthedImpl(env);
  const stdl = new StdlImpl(authed);
  const status = await stdl.cancel(stdlUrl, platform, uid);
  console.log(status);
});
