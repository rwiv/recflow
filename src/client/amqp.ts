import amqplib, { Channel, Connection } from 'amqplib';
import { AmqpConfig } from '../common/configs.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { log } from 'jslog';

export interface Amqp {
  init(): Promise<void>;
  createChannel(): Promise<Channel>;
  checkQueue(queue: string): Promise<boolean>;
  assertQueue(queue: string): Promise<amqplib.Replies.AssertQueue>;
  publish(queue: string, content: object): boolean;
  close(): Promise<void>;
}

@Injectable()
export class AmqpImpl implements Amqp {
  private conn: Connection | undefined = undefined;
  private ch: Channel | undefined = undefined;
  private readonly conf: AmqpConfig;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.conf = this.env.amqp;
  }

  async init() {
    const { host, port, username, password } = this.conf;
    this.conn = await amqplib.connect(
      `amqp://${username}:${password}@${host}:${port}`,
    );
    this.ch = await this.createChannel();
  }

  createChannel() {
    if (this.conn === undefined) {
      throw new Error('Connection is not initialized');
    }
    return this.conn.createChannel();
  }

  async checkQueue(queue: string): Promise<boolean> {
    if (this.ch === undefined) {
      throw new Error('Channel is not initialized');
    }
    try {
      await this.ch.checkQueue(queue);
      return true;
    } catch (e) {
      return false;
    }
  }

  async assertQueue(queue: string) {
    if (this.ch === undefined) {
      throw new Error('Channel is not initialized');
    }
    return this.ch.assertQueue(queue, {
      exclusive: false,
      durable: false,
      autoDelete: false,
    });
  }

  publish(queue: string, content: object) {
    if (this.ch === undefined) {
      throw new Error('Channel is not initialized');
    }
    return this.ch.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
  }

  close() {
    return this.conn?.close();
  }
}

@Injectable()
export class AmqpMock implements Amqp {
  async init() {
    log.info('AmqpMock.connect()');
    return;
  }

  createChannel() {
    log.info('AmqpMock.createChannel()');
    return Promise.resolve({} as Channel);
  }

  checkQueue(queue: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async assertQueue(queue: string) {
    log.info(`AmqpMock.assertQueue(${queue})`);
    return {} as amqplib.Replies.AssertQueue;
  }

  publish(queue: string, content: object) {
    log.info(`AmqpMock.publish(${queue}, ${content})`);
    return true;
  }

  async close() {
    log.info('AmqpMock.close()');
    return;
  }
}
