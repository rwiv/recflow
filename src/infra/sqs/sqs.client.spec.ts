import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { SQSClient } from './sqs.client.js';

const env = readEnv();
const client = new SQSClient(env);

it('test send', async () => {
  for (let i = 0; i < 2; i++) {
    await client.send(`test${i}`);
  }
});

it('test receive', async () => {
  const messages = await client.receive();
  for (const message of messages) {
    console.log(message.body);
  }
  await client.delete(messages);
});
