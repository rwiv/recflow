import { describe, it, afterEach, expect, beforeAll } from 'vitest';
import { createRedisClient } from './redis.js';
import { AsyncMap } from './interface.js';
import { RedisMap } from './map.redis.js';
import { readEnv } from '../../common/config/env.js';

describe.skip('RedisMap (with real Redis client)', async () => {
  let map: AsyncMap<string, { name: string }>;

  beforeAll(async () => {
    const env = readEnv();
    const redis = await createRedisClient(env.stdlRedisMaster);
    map = new RedisMap(redis, keysKey, keyPrefix);
    // map = new MemoryMap();
  });

  const keysKey = 'test:keys';
  const keyPrefix = 'test:prefix:';

  afterEach(async () => {
    await map.clear();
  });

  it('should set and get an item', async () => {
    const id = '123';
    const value = { name: 'test item' };

    await map.set(id, value);

    const result = await map.get(id);
    expect(result).toEqual(value);
  });

  it('should delete an item', async () => {
    const id = '123';
    const value = { name: 'item to delete' };

    await map.set(id, value);
    await map.delete(id);

    const result = await map.get(id);
    expect(result).toBeUndefined();
  });

  it('should throw an error when deleting a non-existent key', async () => {
    const id = '123';

    await expect(map.delete(id)).rejects.toThrow();
  });

  it('should clear all items', async () => {
    await map.set('1', { name: 'item1' });
    await map.set('2', { name: 'item2' });

    await map.clear();

    const size = await map.size();
    expect(size).toBe(0);
  });

  it('should return the correct size', async () => {
    await map.set('1', { name: 'item1' });
    await map.set('2', { name: 'item2' });

    const size = await map.size();
    expect(size).toBe(2);
  });

  it('should return keys without prefix', async () => {
    await map.set('1', { name: 'item1' });
    await map.set('2', { name: 'item2' });

    const keys = await map.keys();
    expect(keys).toEqual(expect.arrayContaining(['1', '2']));
  });

  it('should return all values', async () => {
    const values = [{ name: 'item1' }, { name: 'item2' }];

    await map.set('1', values[0]);
    await map.set('2', values[1]);

    const result = await map.values();
    expect(result).toEqual(expect.arrayContaining(values));
  });

  it('should return all entries', async () => {
    const values = [{ name: 'item1' }, { name: 'item2' }];

    await map.set('1', values[0]);
    await map.set('2', values[1]);

    const entries = await map.entries();
    expect(entries).toEqual(
      expect.arrayContaining([
        ['1', values[0]],
        ['2', values[1]],
      ]),
    );
  });
});
