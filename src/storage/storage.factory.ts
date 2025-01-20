import { Inject, Injectable } from '@nestjs/common';
import { ENV, QUERY } from '../common/common.module.js';
import { QueryConfig } from '../common/query.js';
import { TargetRepositoryRedis } from './target-repository.redis.js';
import { TargetRepositoryMem } from './target-repository.mem.js';
import { Env } from '../common/env.js';

@Injectable()
export class StorageFactory {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
  ) {}

  createTargetRepository() {
    switch (this.env.nodeEnv) {
      case 'prod':
        return this.createTargetRepositoryRedis();
      case 'stage':
        return this.createTargetRepositoryRedis();
      case 'dev':
        return this.createTargetRepositoryMem();
      default:
        throw Error('Unsupported env');
    }
  }

  async createTargetRepositoryRedis() {
    const targets = new TargetRepositoryRedis(this.env, this.query);
    await targets.init();
    return targets;
  }

  createTargetRepositoryMem() {
    return new TargetRepositoryMem(this.query);
  }
}
