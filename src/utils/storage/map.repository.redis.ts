import { RedisClientType } from 'redis';

export class RedisRepository<T> {
  constructor(
    private readonly client: RedisClientType,
    private readonly keysKey: string,
    private readonly keyPrefix: string,
  ) {}

  async clear() {
    await Promise.all((await this.keys()).map((key) => this.client.del(key)));
    await this.client.del(this.keysKey);
  }

  async keys() {
    return this.client.sMembers(this.keysKey);
  }

  async get(id: string) {
    const value = await this.client.get(this.keyPrefix + id);
    if (!value) return undefined;
    return JSON.parse(value) as T;
  }

  async set(id: string, value: T) {
    const key = this.keyPrefix + id;
    if (await this.client.get(key)) throw Error(`${id} is already exists`);

    await this.client.set(key, JSON.stringify(value));
    await this.client.sAdd(this.keysKey, key);

    return value;
  }

  async delete(id: string) {
    const live = await this.get(id);
    if (!live) throw Error(`${id} is not found`);

    const key = this.keyPrefix + id;
    await this.client.del(key);
    await this.client.sRem(this.keysKey, key);

    return live;
  }

  async all() {
    const promises = (await this.keys()).map((key) =>
      this.get(key.replace(this.keyPrefix, '')),
    );
    return Promise.all(promises);
  }
}
