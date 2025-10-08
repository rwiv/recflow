import { describe, it } from 'vitest';
import { StdlImpl } from './stdl.client.impl.js';
import { readEnv } from '../../common/config/env.js';

describe.skip('StdlImpl', () => {
  const env = readEnv();
  const stdl = new StdlImpl(env);

  const stdlUrl = '';

  it('getStatus', async () => {
    const status = await stdl.getStatus(stdlUrl);
    console.log(status);
  });

  it('cancelRecording', async () => {
    const recordId = '';
    await stdl.cancelRecording(stdlUrl, recordId);
  });
});
