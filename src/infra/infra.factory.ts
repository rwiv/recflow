import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { Env } from '../common/config/env.js';
import { StdlRedisMock } from './stdl/stdl.redis.mock.js';
import { StdlRedisImpl } from './stdl/stdl.redis.impl.js';
import { createRedisClient } from './redis/redis.client.js';
import { RedisStoreImpl, RedisStoreMock } from './redis/redis.store.js';

@Injectable()
export class InfraFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createServerRedis() {
    if (this.env.nodeEnv === 'dev') {
      return new RedisStoreMock();
    }
    const client = await createRedisClient(this.env.serverRedis);
    return new RedisStoreImpl(client);
  }

  async createStdlRedis() {
    if (this.env.nodeEnv === 'dev') {
      return new StdlRedisMock();
    }
    const client = await createRedisClient(this.env.stdlRedis);
    return new StdlRedisImpl(client);
  }
}
