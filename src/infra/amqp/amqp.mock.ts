import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import amqplib, { Channel } from 'amqplib';
import { Amqp } from './amqp.interface.js';

@Injectable()
export class AmqpMock implements Amqp {
  init() {
    log.info('AmqpMock.connect()');
    return Promise.resolve();
  }

  createChannel() {
    log.info('AmqpMock.createChannel()');
    return Promise.resolve({} as Channel);
  }

  async assertQueue(queue: string) {
    log.info(`AmqpMock.assertQueue(${queue})`);
    return {} as amqplib.Replies.AssertQueue;
  }

  publish(queue: string, content: object) {
    log.info('AmqpMock.publish(...)', { queue, content });
    return true;
  }

  async close() {
    log.info('AmqpMock.close()');
    return;
  }
}
