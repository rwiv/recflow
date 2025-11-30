import { RedisClientType } from 'redis';

import { AsyncMap } from '@/utils/storage/interface.js';

export class RedisMap<T> implements AsyncMap<string, T> {
  constructor(
    private readonly client: RedisClientType,
    private readonly keysKey: string,
    private readonly keyPrefix: string,
  ) {}

  async get(id: string) {
    const value = await this.client.get(this.keyPrefix + id);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(id: string, value: T) {
    const key = this.keyPrefix + id;
    await this.client.set(key, JSON.stringify(value));
    await this.client.sAdd(this.keysKey, key);
  }

  async delete(id: string) {
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);

    const key = this.keyPrefix + id;
    await this.client.del(key);
    await this.client.sRem(this.keysKey, key);
  }

  async clear() {
    await Promise.all((await this.keys()).map((key) => this.delete(key)));
    await this.client.del(this.keysKey);
  }

  async size(): Promise<number> {
    return (await this.keys()).length;
  }

  async keys() {
    return (await this.rawKeys()).map((key) => key.replace(this.keyPrefix, ''));
  }

  async rawKeys() {
    return await this.client.sMembers(this.keysKey);
  }

  async values(): Promise<T[]> {
    const values = await Promise.all((await this.keys()).map((key) => this.get(key)));
    return values.filter((value) => value !== null);
  }

  async entries(): Promise<[string, T][]> {
    const result: [string, T][] = [];
    for (const key of await this.keys()) {
      const value = await this.get(key.replace(this.keyPrefix, ''));
      if (value) {
        result.push([key, value]);
      }
    }
    return result;
  }
}
