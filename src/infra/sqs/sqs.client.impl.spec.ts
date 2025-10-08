import { describe, it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { SQSClientImpl } from './sqs.client.impl.js';

describe.skip('SQSClientImpl', () => {
  const env = readEnv();
  const client = new SQSClientImpl(env);

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
});
