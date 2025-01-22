import { AmqpImpl } from './amqp.js';
import { readEnv } from '../common/env.js';
import { it } from 'vitest';

it('test all', async () => {
  const queue = 'tasks';
  const amqp = new AmqpImpl(readEnv());
  await amqp.init();
  await amqp.assertQueue(queue);

  const newChannel = await amqp.createChannel();
  await newChannel.consume(queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString()) as { msg: string };
      console.log(content);
      newChannel.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });

  setInterval(() => {
    amqp.publish(queue, { msg: 'Hello World!' });
  }, 1000);

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 3500);
  });
});

it('test publish', async () => {
  const queue = 'tasks';
  const amqp = new AmqpImpl(readEnv());
  await amqp.init();
  await amqp.assertQueue(queue);

  setInterval(() => {
    amqp.publish(queue, { msg: 'Hello World!' });
  }, 1000);

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 3500);
  });
});

it('test existQueue', async () => {
  const queue = 'tasks';
  const amqp = new AmqpImpl(readEnv());
  await amqp.init();

  // await amqp.assertQueue(queue);
  const res = await amqp.checkQueue(queue);
  console.log(res);
});
