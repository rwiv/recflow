import { it } from 'vitest';
import { StdlImpl } from './stdl.client.impl.js';

const stdlUrl = '';

it('test getStatus', async () => {
  const stdl = new StdlImpl();
  const status = await stdl.getStatus(stdlUrl);
  console.log(status);
});
