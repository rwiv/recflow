import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createRedisClient } from '@/utils/redis.js';

import { readEnv } from '@/common/config/env.js';

import { RedisCacheStore } from '@/infra/cache/cache.store.redis.js';

describe.skip('RedisCacheStore', () => {
  let cache: RedisCacheStore;

  beforeEach(async () => {
    const env = readEnv();
    const redis = await createRedisClient(env.recnodeRedisMaster);
    cache = new RedisCacheStore(redis, 100);
  });

  afterEach(async () => {
    await cache.dropAllKeys();
  });

  it('get: should return null for a non-existent key', async () => {
    await expect(cache.get('nonexistent')).resolves.toBeNull();
  });

  it('set and get: should set and retrieve a string value', async () => {
    const key = 'mykey';
    const value = 'myvalue';
    await cache.set(key, value, {});
    await expect(cache.get(key)).resolves.toBe(value);
  });

  it('mGet: should retrieve multiple string values', async () => {
    await cache.set('key1', 'value1', {});
    await cache.set('key2', 'value2', {});
    const result = await cache.mGet(['key1', 'key2', 'nonexistent']);
    expect(result).toEqual(['value1', 'value2', null]);
  });

  it('exists: should return true for an existing string key', async () => {
    await cache.set('key1', 'value1', {});
    await expect(cache.exists('key1')).resolves.toBe(true);
  });

  it('exists: should return true for an existing list key', async () => {
    await cache.addItem('list1', 'item1');
    await expect(cache.exists('list1')).resolves.toBe(true);
  });

  it('exists: should return false for a non-existent key', async () => {
    await expect(cache.exists('nonexistent')).resolves.toBe(false);
  });

  it('addItem: should add an item to a new list', async () => {
    const key = 'newlist';
    const value = 'item1';
    await cache.addItem(key, value);
    await expect(cache.list(key)).resolves.toEqual([value]);
  });

  it('addItem: should add an item to an existing list', async () => {
    const key = 'existinglist';
    await cache.addItem(key, 'item1');
    await cache.addItem(key, 'item2');
    await expect(cache.list(key)).resolves.toEqual(['item1', 'item2']);
  });

  it('deleteItem: should delete an item from a list', async () => {
    const key = 'listtodelete';
    await cache.addItem(key, 'item1');
    await cache.addItem(key, 'item2');
    await cache.deleteItem(key, 'item1');
    await expect(cache.list(key)).resolves.toEqual(['item2']);
  });

  it('list: should return an empty array for a non-existent list', async () => {
    await expect(cache.list('nonexistentlist')).resolves.toEqual([]);
  });

  it('list: should return all items in a list', async () => {
    const key = 'mylist';
    await cache.addItem(key, 'item1');
    await cache.addItem(key, 'item2');
    await cache.addItem(key, 'item3');
    await expect(cache.list(key)).resolves.toEqual(['item1', 'item2', 'item3']);
  });

  it('delete: should delete a string key', async () => {
    const key = 'keytodelete';
    await cache.set(key, 'value', {});
    await cache.delete(key);
    await expect(cache.get(key)).resolves.toBeNull();
  });

  it('delete: should delete a list key', async () => {
    const key = 'listtodelete';
    await cache.addItem(key, 'item');
    await cache.delete(key);
    await expect(cache.list(key)).resolves.toEqual([]);
  });

  it('deleteBatch: should delete multiple keys', async () => {
    await cache.set('key1', 'value1', {});
    await cache.addItem('list1', 'item1');
    await cache.set('key2', 'value2', {});
    await cache.deleteBatch(['key1', 'list1']);
    await expect(cache.get('key1')).resolves.toBeNull();
    await expect(cache.list('list1')).resolves.toEqual([]);
    await expect(cache.get('key2')).resolves.toBe('value2');
  });

  it('dropAllKeys: should delete all keys', async () => {
    await cache.set('key1', 'value1', {});
    await cache.addItem('list1', 'item1');
    await cache.set('key2', 'value2', {});
    await cache.dropAllKeys();
    await expect(cache.get('key1')).resolves.toBeNull();
    await expect(cache.list('list1')).resolves.toEqual([]);
    await expect(cache.get('key2')).resolves.toBeNull();
  });
});
