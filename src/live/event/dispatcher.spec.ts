import { it } from 'vitest';
import { AmqpImpl } from '../../infra/amqp/amqp.impl.js';
import { readEnv } from '../../common/config/env.js';
import { Dispatcher } from './dispatcher.js';

const env = readEnv();
const amqp = new AmqpImpl(env);
const dispatcher = new Dispatcher(amqp);
const pid = '';

it('test cancel', async () => {
  await amqp.init();
  await dispatcher.exit('cancel', 'chzzk', pid);
});

it('test finish', async () => {
  await amqp.init();
  await dispatcher.exit('finish', 'chzzk', pid);
});
