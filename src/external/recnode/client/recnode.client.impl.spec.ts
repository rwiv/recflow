import { describe, it, beforeAll } from 'vitest';
import { RecnodeImpl } from './recnode.client.impl.js';
import { readEnv } from '../../../common/config/env.js';

describe.skip('RecnodeImpl', () => {
  let recnode: RecnodeImpl;

  beforeAll(() => {
    recnode = new RecnodeImpl(readEnv());
  });

  const recnodeUrl = '';

  it('getStatus', async () => {
    const status = await recnode.getStatus(recnodeUrl);
    console.log(status);
  });

  it('cancelRecording', async () => {
    const recordId = '';
    await recnode.cancelRecording(recnodeUrl, recordId);
  });
});
