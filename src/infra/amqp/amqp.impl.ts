import amqplib, { Channel, Connection } from 'amqplib';
import { AmqpConfig } from '../../common/config.types.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config.module.js';
import { Env } from '../../common/env.js';
import { Amqp } from './interface.js';

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
    this.conn = await amqplib.connect(`amqp://${username}:${password}@${host}:${port}`);
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

  async close() {
    await this.conn?.close();
  }
}
