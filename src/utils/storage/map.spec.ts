import { describe, it, afterEach, expect } from 'vitest';
import { readEnv } from '../../common/env.js';
import { createRedisClient } from './redis.js';
import { AsyncMap } from './interface.js';
import { RedisMap } from './map.redis.js';

const env = readEnv();

describe('RedisMap (with real Redis client)', async () => {
  const keysKey = 'test:keys';
  const keyPrefix = 'test:prefix:';
  const redis = await createRedisClient(env.redis);
  const map: AsyncMap<string, { name: string }> = new RedisMap(redis, keysKey, keyPrefix);
  // const map: AsyncMap<string, { name: string }> = new MemoryMap();

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

  it('should throw an error when setting a duplicate key', async () => {
    const id = '123';
    const value = { name: 'duplicate test' };

    await map.set(id, value);

    await expect(map.set(id, value)).rejects.toThrow();
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
