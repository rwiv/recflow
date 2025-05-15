import { RedisClientType } from 'redis';

export interface SetOptions {
  keepEx?: boolean;
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

  async set(key: string, value: string, opts: SetOptions): Promise<void> {
    let ex = this.exSec;
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
