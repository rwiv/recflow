import { describe, it, beforeAll } from 'vitest';
import { StdlImpl } from './stdl.client.impl.js';
import { readEnv } from '../../common/config/env.js';

describe.skip('StdlImpl', () => {
  let stdl: StdlImpl;

  beforeAll(() => {
    stdl = new StdlImpl(readEnv());
  });

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
