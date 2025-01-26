import { StdlImpl } from './stdl.js';
import { readEnv } from '../common/env.js';
import { AuthedImpl } from './authed.js';
import { it } from 'vitest';
import { readQueryConfig } from '../common/query.js';

const uid = '';

it('test', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(env);

  const stdlUrl = query.webhooks.find((wh) => (wh.type = 'main'))?.url;
  if (!stdlUrl) {
    throw new Error('stdlUrl not found');
  }
  const cookies = await authClient.requestChzzkCookies();
  await stdl.requestChzzkLive(stdlUrl, uid, cookies);
});
