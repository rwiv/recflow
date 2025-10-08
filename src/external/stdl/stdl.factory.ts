import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { stdlLocationType } from './common/stdl.types.js';
import { StdlRedisImpl } from './redis/stdl.redis.impl.js';
import { createRedisClient } from '../../utils/storage/redis.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class StdlFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createStdlRedis() {
    const defaultLocation = stdlLocationType.safeParse(this.env.stdlDefaultLocation);
    if (!defaultLocation.success) {
      throw new ValidationError(`Invalid stdlLocationType: ${this.env.stdlDefaultLocation}`);
    }
    const followedLocation = stdlLocationType.safeParse(this.env.stdlFollowedLocation);
    if (!followedLocation.success) {
      throw new ValidationError(`Invalid stdlLocationType: ${this.env.stdlFollowedLocation}`);
    }
    const master = await createRedisClient(this.env.stdlRedisMaster);
    const replica = await createRedisClient(this.env.stdlRedisReplica);
    return new StdlRedisImpl(master, replica, this.env.liveStateExpireSec, defaultLocation.data, followedLocation.data);
  }
}
