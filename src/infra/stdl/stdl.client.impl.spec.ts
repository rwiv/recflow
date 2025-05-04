import { it } from 'vitest';
import { StdlImpl } from './stdl.client.impl.js';
import { readEnv } from '../../common/config/env.js';

const stdlUrl = '';
const env = readEnv();

it('test getStatus', async () => {
  const stdl = new StdlImpl(env);
  const status = await stdl.getStatus(stdlUrl);
  console.log(status);
});
