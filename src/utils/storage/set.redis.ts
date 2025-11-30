import { RedisClientType } from 'redis';

import { AsyncSet } from '@/utils/storage/interface.js';

export class RedisSet<T> implements AsyncSet<T> {
  constructor(
    private readonly client: RedisClientType,
    private readonly key: string,
  ) {}

  async add(value: T) {
    await this.client.sAdd(this.key, JSON.stringify(value));
  }

  async delete(value: T) {
    await this.client.sRem(this.key, JSON.stringify(value));
  }

  async clear() {
    await this.client.del(this.key);
  }

  async size() {
    return await this.client.sCard(this.key);
  }

  has(value: T): Promise<boolean> {
    return this.client.sIsMember(this.key, JSON.stringify(value));
  }

  async values() {
    return (await this.client.sMembers(this.key)).map((value) => JSON.parse(value) as T);
  }
}
