import { readEnv } from '../../common/env.js';
import { it } from 'vitest';
import { AuthedImpl } from './authed.impl.js';

it('test', async () => {
  const env = readEnv();
  const client = new AuthedImpl(env);

  const cookies = await client.requestChzzkCookies();
  console.log(JSON.stringify(cookies));

  const soopCred = await client.requestSoopCred();
  console.log(soopCred);
});
