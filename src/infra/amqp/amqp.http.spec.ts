import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { AmqpHttpImpl } from './amqp-http.impl.js';

const env = readEnv();
const pattern = 'stdl.*';
// const pattern = 'stdl.exit.*';

// it('test', async () => {
//   const client = new AmqpHttpImpl(env);
//   // const queues = await client.fetchAllQueues();
//   const queues = await client.fetchByPattern(pattern);
//   for (const queue of queues) {
//     console.log(queue.name, queue.state);
//   }
// });
