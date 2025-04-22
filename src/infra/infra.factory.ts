import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { AmqpImpl } from './amqp/amqp.impl.js';
import { Env } from '../common/config/env.js';
import { AmqpMock } from './amqp/amqp.mock.js';
import { AmqpHttpImpl } from './amqp/amqp-http.impl.js';
import { AmqpHttpMock } from './amqp/amqp-http.mock.js';
import { StdlRedisMock } from './stdl/stdl.redis.mock.js';
import { StdlRedisImpl } from './stdl/stdl.redis.impl.js';
import { createRedisClient } from './redis/redis.client.js';
import { AUTHED } from './infra.tokens.js';
import { Authed } from './authed/authed.js';

@Injectable()
export class InfraFactory {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(AUTHED) private readonly authed: Authed,
  ) {}

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

  async createStdlRedis() {
    if (this.env.nodeEnv === 'dev') {
      return new StdlRedisMock();
    }
    const client = await createRedisClient(this.env.stdlRedis);
    return new StdlRedisImpl(client, this.authed);
  }
}
