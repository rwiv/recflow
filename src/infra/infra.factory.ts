import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { Env } from '../common/config/env.js';
import { createIoRedisClient, createRedisClient } from './redis/redis.client.js';
import { RedisStore } from './redis/redis.store.js';

@Injectable()
export class InfraFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createServerRedis() {
    const client = await createRedisClient(this.env.serverRedis);
    return new RedisStore(client, this.env.cacheExpireSec);
  }

  createTaskRedis() {
    return createIoRedisClient(this.env.serverRedis, 1);
  }
}
