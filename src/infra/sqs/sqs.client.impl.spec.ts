import { describe, it, beforeAll } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { SQSClientImpl } from './sqs.client.impl.js';

describe.skip('SQSClientImpl', () => {
  let sqs: SQSClientImpl;

  beforeAll(() => {
    sqs = new SQSClientImpl(readEnv());
  });

  it('test send', async () => {
    for (let i = 0; i < 2; i++) {
      await sqs.send(`test${i}`);
    }
  });

  it('test receive', async () => {
    const messages = await sqs.receive();
    for (const message of messages) {
      console.log(message.body);
    }
    await sqs.delete(messages);
  });
});
