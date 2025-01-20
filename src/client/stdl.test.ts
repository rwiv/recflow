import { StdlImpl } from './stdl.js';
import { readEnv } from '../common/env.js';
import { AuthedImpl } from './authed.js';
import { it } from 'vitest';
import {readQueryConfig} from "../common/query.js";

it('test', async () => {
  const env = readEnv();
  const query = readQueryConfig(env.configPath);
  const stdlUrl = query.webhooks.find((wh) => wh.type = "main")?.url;
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(env);

  const uid = '';
  const cookies = await authClient.requestChzzkCookies();
  // const cookies = undefined;
  await stdl.requestChzzkLive(stdlUrl, uid, true, cookies);
});
