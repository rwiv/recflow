import { it } from 'vitest';
import { VtaskImpl } from './vtask.impl.js';
import { readEnv } from '../../common/config/env.js';
import { StdlDoneMessage } from './types.js';

const endpoint = '';

it('test', async () => {
  const env = readEnv();
  const client = new VtaskImpl(env);
  const doneMessage: StdlDoneMessage = {
    platform: 'chzzk',
    uid: '',
    videoName: '',
    fsName: '',
    status: 'canceled',
  };
  const status = await client.addTask(doneMessage);
  console.log(status);
});
