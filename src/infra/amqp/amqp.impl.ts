import amqplib, { Channel, Connection } from 'amqplib';
import { AmqpConfig } from '../../common/config/config.types.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Amqp } from './amqp.interface.js';
import { UninitializedError } from '../../utils/errors/errors/UninitializedError.js';

@Injectable()
export class AmqpImpl implements Amqp {
  private conn: Connection | undefined = undefined;
  private ch: Channel | undefined = undefined;

  constructor(private readonly conf: AmqpConfig) {}

  async init() {
    const { host, port, username, password } = this.conf;
    this.conn = await amqplib.connect(`amqp://${username}:${password}@${host}:${port}`);
    this.ch = await this.createChannel();
  }

  createChannel() {
    if (this.conn === undefined) {
      throw new UninitializedError('Connection is not initialized');
    }
    return this.conn.createChannel();
  }

  async assertQueue(queue: string) {
    if (this.ch === undefined) {
      throw new UninitializedError('Channel is not initialized');
    }
    return this.ch.assertQueue(queue, {
      exclusive: false,
      durable: false,
      autoDelete: false,
    });
  }

  publish(queue: string, content: object) {
    if (this.ch === undefined) {
      throw new UninitializedError('Channel is not initialized');
    }
    return this.ch.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
  }

  async close() {
    await this.conn?.close();
  }
}
