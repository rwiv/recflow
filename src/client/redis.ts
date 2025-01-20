import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from '../common/configs.js';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../common/common.module.js';
import { Env } from '../common/env.js';

@Injectable()
export class Redis {
  private client: RedisClientType | undefined = undefined;
  private readonly conf: RedisConfig;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.conf = this.env.redis;
  }

  async init() {
    this.client = await this.createClient();
  }

  close() {
    if (this.client) {
      return this.client.disconnect();
    } else {
      return Promise.resolve();
    }
  }

  get(key: string) {
    if (!this.client) {
      throw new Error('CacheRepository not initialized');
    }
    return this.client.get(key);
  }

  set(key: string, value: string, expire: number | undefined = undefined) {
    if (!this.client) {
      throw new Error('CacheRepository not initialized');
    }
    if (expire) {
      return this.client.set(key, value, { EX: expire });
    } else {
      return this.client.set(key, value);
    }
  }

  del(key: string) {
    if (!this.client) {
      throw new Error('CacheRepository not initialized');
    }
    return this.client.del(key);
  }

  private async createClient() {
    const url = `redis://${this.conf.host}:${this.conf.port}`;
    const client = await createClient({ url, password: this.conf.password })
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect();
    return client as RedisClientType;
  }
}
