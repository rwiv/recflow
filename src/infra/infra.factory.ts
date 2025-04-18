import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { AmqpImpl } from './amqp/amqp.impl.js';
import { Env } from '../common/config/env.js';
import { AmqpMock } from './amqp/amqp.mock.js';
import { AmqpHttpImpl } from './amqp/amqp-http.impl.js';
import { AmqpHttpMock } from './amqp/amqp-http.mock.js';

@Injectable()
export class InfraFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createAmqp() {
    if (this.env.nodeEnv === 'dev') {
      return new AmqpMock();
    }
    const amqp = new AmqpImpl(this.env);
    await amqp.init();
    return amqp;
  }

  createAmqpHttp() {
    if (this.env.nodeEnv === 'dev') {
      return new AmqpHttpMock();
    }
    return new AmqpHttpImpl(this.env);
  }
}
