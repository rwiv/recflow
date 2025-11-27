import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { recnodeLocationType } from './common/recnode.types.js';
import { RecnodeRedisImpl } from './redis/recnode.redis.impl.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { createRedisClient } from '../../utils/redis.js';

@Injectable()
export class RecnodeFactory {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async createRecnodeRedis() {
    const defaultLocation = recnodeLocationType.safeParse(this.env.recnodeDefaultLocation);
    if (!defaultLocation.success) {
      throw new ValidationError(`Invalid recnodeLocationType: ${this.env.recnodeDefaultLocation}`);
    }
    const followedLocation = recnodeLocationType.safeParse(this.env.recnodeFollowedLocation);
    if (!followedLocation.success) {
      throw new ValidationError(`Invalid recnodeLocationType: ${this.env.recnodeFollowedLocation}`);
    }
    const master = await createRedisClient(this.env.recnodeRedisMaster);
    const replica = await createRedisClient(this.env.recnodeRedisReplica);
    return new RecnodeRedisImpl(
      master,
      replica,
      this.env.liveStateExpireSec,
      defaultLocation.data,
      followedLocation.data,
    );
  }
}
