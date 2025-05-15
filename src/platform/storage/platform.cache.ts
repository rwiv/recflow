import { Inject, Injectable } from '@nestjs/common';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { RedisStore } from '../../infra/redis/redis.store.js';

@Injectable()
export class PlatformCacheStore {
  constructor(@Inject(SERVER_REDIS) private readonly redis: RedisStore) {}
}
