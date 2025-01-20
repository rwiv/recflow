import { StdlImpl } from './stdl.js';
import { readEnv } from '../common/env.js';
import { AuthedImpl } from './authed.js';
import { it } from 'vitest';

it('test', async () => {
  const { stdlUrl, authedUrl, authedEncKey } = readEnv();
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(authedUrl, authedEncKey);

  const uid = '';
  const cookies = await authClient.requestChzzkCookies();
  // const cookies = undefined;
  await stdl.requestChzzkLive(stdlUrl, uid, true, cookies);
});
