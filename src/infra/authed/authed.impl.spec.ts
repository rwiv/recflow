import { readEnv } from '../../common/config/env.js';
import { it } from 'vitest';
import { AuthedImpl } from './authed.impl.js';

it('test', async () => {
  const env = readEnv();
  const client = new AuthedImpl(env);

  console.log(await client.requestSoopCookiesStr());
});
