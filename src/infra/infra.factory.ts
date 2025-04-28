import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { Env } from '../common/config/env.js';
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

  async createStdlRedis() {
    if (this.env.nodeEnv === 'dev') {
      return new StdlRedisMock();
    }
    const client = await createRedisClient(this.env.stdlRedis);
    return new StdlRedisImpl(client, this.authed);
  }
}
