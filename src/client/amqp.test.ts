import { Amqp } from './amqp.js';
import { readEnv } from '../common/env.js';

it('test all', async () => {
  const queue = 'tasks';
  const amqp = new Amqp(readEnv().amqp);
  await amqp.connect();
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
  const amqp = new Amqp(readEnv().amqp);
  await amqp.connect();
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
