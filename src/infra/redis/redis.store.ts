import { RedisClientType } from 'redis';
import { HttpError } from '../../utils/errors/base/HttpError.js';

export interface RedisStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  deleteBatch(keys: string[]): Promise<void>;
}

export class RedisStoreImpl implements RedisStore {
  constructor(
    private readonly client: RedisClientType,
    private readonly exSec: number,
  ) {}

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    return await this.client.mGet(keys);
  }

  async set(key: string, value: string): Promise<void> {
    const ret = await this.client.set(key, value, { EX: this.exSec });
    if (ret === null) {
      throw new HttpError(`Failed to set key: ${key}`, 400);
    }
  }

  async delete(key: string): Promise<void> {
    const deleted = await this.client.del(key);
    if (deleted === 0) {
      throw new HttpError(`Failed to delete key: ${key}`, 400);
    }
  }

  async deleteBatch(keys: string[]): Promise<void> {
    const deleted = await this.client.del(keys);
    if (deleted === 0) {
      throw new HttpError(`Failed to delete keys`, 400);
    }
  }
}

export class RedisStoreMock implements RedisStore {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    keys.forEach((key) => this.store.delete(key));
  }
}
