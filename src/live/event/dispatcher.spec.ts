import { it } from 'vitest';
import { AmqpImpl } from '../../infra/amqp/amqp.impl.js';
import { readEnv } from '../../common/config/env.js';
import { Dispatcher } from './dispatcher.js';
import { AmqpHttpImpl } from '../../infra/amqp/amqp-http.impl.js';
import { StdlImpl } from '../../infra/stdl/stdl.impl.js';
import { VtaskImpl } from '../../infra/vtask/vtask.impl.js';
import { AuthedImpl } from '../../infra/authed/authed.impl.js';

const env = readEnv();
const authed = new AuthedImpl(env);
const stdl = new StdlImpl(authed);
const vtask = new VtaskImpl(env);
const dispatcher = new Dispatcher(stdl, vtask);

const nodeEndpoint = '';
const platform = 'chzzk';
const pid = '';

it('test cancel', async () => {
  await dispatcher.sendExitMessage(nodeEndpoint, platform, pid, 'cancel');
});

it('test finish', async () => {
  await dispatcher.sendExitMessage(nodeEndpoint, platform, pid, 'finish');
});
