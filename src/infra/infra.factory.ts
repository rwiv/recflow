import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { Env } from '../common/config/env.js';
import { createIoRedisClient, createRedisClient } from '../utils/redis.js';
import { RedisCacheStore } from './cache/cache.store.redis.js';

@Injectable()
export class InfraFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createServerRedis() {
    const client = await createRedisClient(this.env.serverRedis);
    return new RedisCacheStore(client, this.env.cacheExpireSec);
  }

  createTaskRedis() {
    return createIoRedisClient(this.env.serverRedis, 1);
  }
}
