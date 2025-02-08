import { readEnv } from '../../common/env.js';
import { it } from 'vitest';
import { readQueryConfig } from '../../common/query.js';
import { StdlImpl } from './stdl.impl.js';
import { AuthedImpl } from '../authed/authed.impl.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

const uid = '';

it('test', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(env);

  const stdlUrl = query.webhooks.find((wh) => (wh.type = 'main'))?.url;
  if (!stdlUrl) {
    throw new NotFoundError('stdlUrl not found');
  }
  const cookies = await authClient.requestChzzkCookies();
  await stdl.requestChzzkLive(stdlUrl, uid, cookies);
});
