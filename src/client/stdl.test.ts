import { StdlImpl } from './stdl.js';
import { readEnv } from '../common/env.js';
import { AuthedImpl } from './authed.js';
import { it } from 'vitest';

it('test', async () => {
  const env = readEnv();
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(env);

  const uid = '';
  const cookies = await authClient.requestChzzkCookies();
  // const cookies = undefined;
  await stdl.requestChzzkLive(env.stdlUrl, uid, true, cookies);
});
