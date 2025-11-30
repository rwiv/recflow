import { beforeAll, describe, it } from 'vitest';

import { readEnv } from '@/common/config/env.js';

import { RecnodeImpl } from '@/external/recnode/client/recnode.client.impl.js';

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
