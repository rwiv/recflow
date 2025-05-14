import { it } from 'vitest';
import { StdlImpl } from './stdl.client.impl.js';
import { readEnv } from '../../common/config/env.js';

const stdlUrl = '';
const env = readEnv();
const stdl = new StdlImpl(env);

it('test getStatus', async () => {
  const status = await stdl.getStatus(stdlUrl);
  console.log(status);
});

it('test cancelRecording', async () => {
  const recordId = '';
  await stdl.cancelRecording(stdlUrl, recordId);
});
