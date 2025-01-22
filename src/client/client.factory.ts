import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/common.module.js';
import { AmqpImpl, AmqpMock } from './amqp.js';
import { Env } from '../common/env.js';

@Injectable()
export class ClientFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createAmqp() {
    if (this.env.nodeEnv === 'prod') {
      const amqp = new AmqpImpl(this.env);
      await amqp.init();
      return amqp;
    } else {
      return new AmqpMock();
    }
  }
}
