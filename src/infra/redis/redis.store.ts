import { RedisClientType } from 'redis';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

export interface SetOptions {
  keepEx?: boolean;
  exSec?: number;
}

export class RedisStore {
  constructor(
    public readonly client: RedisClientType,
    public readonly exSec: number,
  ) {}

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    return await this.client.mGet(keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async set(key: string, value: string, opts: SetOptions): Promise<void> {
    let ex = this.exSec;
    if (opts.exSec && opts.keepEx) {
      throw new ValidationError('Cannot set both exSec and keepEx options');
    }
    if (opts.exSec) {
      ex = opts.exSec;
    }
    if (opts.keepEx) {
      const ttl = await this.client.ttl(key);
      if (ttl > 0) {
        ex = ttl;
      }
    }
    await this.client.set(key, value, { EX: ex });
  }

  async addItem(key: string, value: string): Promise<void> {
    await this.client.sAdd(key, value);
  }

  async deleteItem(key: string, value: string): Promise<void> {
    await this.client.sRem(key, value);
  }

  async list(key: string): Promise<string[]> {
    return this.client.sMembers(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    await this.client.del(keys);
  }
}
