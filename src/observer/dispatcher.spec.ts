import { it } from 'vitest';
import { AmqpImpl } from '../client/amqp.js';
import { readEnv } from '../common/env.js';
import { Dispatcher } from './dispatcher.js';
import fs from 'fs';

interface TestConfig {
  channelId: string;
}

const env = readEnv();
const amqp = new AmqpImpl(env);
const dispatcher = new Dispatcher(amqp);
const conf = JSON.parse(
  fs.readFileSync('dev/test_conf.json', 'utf-8'),
) as TestConfig;

it('test cancel', async () => {
  await amqp.init();
  await dispatcher.send('cancel', 'chzzk', conf.channelId);
});

it('test finish', async () => {
  await amqp.init();
  await dispatcher.send('finish', 'chzzk', conf.channelId);
});
