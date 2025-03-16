import { readEnv } from '../../common/config/env.js';
import { it } from 'vitest';
import { AuthedImpl } from './authed.impl.js';

it('test', async () => {
  const env = readEnv();
  const client = new AuthedImpl(env);

  const chzzkCookies = await client.requestChzzkCookies();
  console.log(JSON.stringify(chzzkCookies));

  const soopCookies = await client.requestSoopCookies();
  console.log(JSON.stringify(soopCookies));
});
