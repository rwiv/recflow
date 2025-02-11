import { readEnv } from '../../common/config/env.js';
import { it } from 'vitest';
import { StdlImpl } from './stdl.impl.js';
import { AuthedImpl } from '../authed/authed.impl.js';

const uid = '';

it('test', async () => {
  const env = readEnv();
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(env);

  const stdlUrl = '';
  const cookies = await authClient.requestChzzkCookies();
  await stdl.requestChzzkLive(stdlUrl, uid, cookies);
});
