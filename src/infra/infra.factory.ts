import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/config/config.module.js';
import { Env } from '../common/config/env.js';
import { StdlRedisImpl } from './stdl/stdl.redis.impl.js';
import { createRedisClient } from './redis/redis.client.js';
import { RedisStore } from './redis/redis.store.js';
import { stdlLocationType } from './stdl/stdl.types.js';
import { ValidationError } from '../utils/errors/errors/ValidationError.js';

@Injectable()
export class InfraFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createServerRedis() {
    const client = await createRedisClient(this.env.serverRedis);
    return new RedisStore(client, this.env.cacheExpireSec);
  }

  async createStdlRedis() {
    const defaultLocation = stdlLocationType.safeParse(this.env.stdlDefaultLocation);
    if (!defaultLocation.success) {
      throw new ValidationError(`Invalid stdlLocationType: ${this.env.stdlDefaultLocation}`);
    }
    const master = await createRedisClient(this.env.stdlRedisMaster);
    const replica = await createRedisClient(this.env.stdlRedisReplica);
    return new StdlRedisImpl(master, replica, this.env.liveStateExpireSec, defaultLocation.data);
  }
}
