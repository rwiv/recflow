import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { Env } from '../common/config/env.js';
import { StdlRedisImpl } from './stdl/stdl.redis.impl.js';
import { createRedisClient } from './redis/redis.client.js';
import { RedisStoreImpl } from './redis/redis.store.js';

@Injectable()
export class InfraFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createServerRedis() {
    // if (this.env.nodeEnv === 'dev') {
    //   return new RedisStoreMock();
    // }
    const client = await createRedisClient(this.env.serverRedis);
    return new RedisStoreImpl(client, this.env.recordExpireSec);
  }

  async createStdlRedis() {
    // if (this.env.nodeEnv === 'dev') {
    //   return new StdlRedisMock();
    // }
    const client = await createRedisClient(this.env.stdlRedis);
    return new StdlRedisImpl(client, this.env.liveExpireSec);
  }
}
