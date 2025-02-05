import { it } from 'vitest';
import { readEnv } from '../../common/env.js';
import { AmqpHttp } from './amqp.http.js';

const env = readEnv();
const pattern = 'stdl.*';
// const pattern = 'stdl.exit.*';

it('test', async () => {
  const client = new AmqpHttp(env.amqp);
  // const queues = await client.fetchAllQueues();
  const queues = await client.fetchByPattern(pattern);
  for (const queue of queues) {
    console.log(queue.name, queue.state);
  }
});
