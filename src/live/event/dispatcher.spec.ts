import { it } from 'vitest';
import fs from 'fs';
import { AmqpImpl } from '../../infra/amqp/amqp.impl.js';
import { readEnv } from '../../common/env.js';
import { Dispatcher } from './dispatcher.js';

interface TestConfig {
  channelId: string;
}

const env = readEnv();
const amqp = new AmqpImpl(env);
const dispatcher = new Dispatcher(amqp);
const conf = JSON.parse(fs.readFileSync('dev/test_conf.json', 'utf-8')) as TestConfig;

it('test cancel', async () => {
  await amqp.init();
  await dispatcher.exit('cancel', 'chzzk', conf.channelId);
});
