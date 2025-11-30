import dotenv from 'dotenv';
import path from 'path';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createRedisClient } from '@/utils/redis.js';
import { AsyncSet } from '@/utils/storage/interface.js';
import { RedisSet } from '@/utils/storage/set.redis.js';

import { readRecnodeRedisMasterConfig } from '@/common/config/env.utils.js';

describe.skip('RedisSet', () => {
  let set: AsyncSet<string>;

  const testKey = 'test:set';

  beforeAll(async () => {
    dotenv.config({ path: path.resolve('dev', '.env') });
    const conf = readRecnodeRedisMasterConfig();

    const redis = await createRedisClient(conf);
    set = new RedisSet<string>(redis, testKey);
    // set = new MemorySet<string>();
  });

  afterEach(async () => {
    await set.clear();
  });

  it('should add a value to the set', async () => {
    await set.add('value1');
    const size = await set.size();
    expect(size).toBe(1);

    const values = await set.values();
    expect(values).toEqual(['value1']);
  });

  it('should delete a value from the set', async () => {
    await set.add('value1');
    await set.add('value2');
    await set.delete('value1');

    const size = await set.size();
    expect(size).toBe(1);

    const values = await set.values();
    expect(values).toEqual(['value2']);
  });

  it('should clear the set', async () => {
    await set.add('value1');
    await set.add('value2');
    await set.clear();

    const size = await set.size();
    expect(size).toBe(0);

    const values = await set.values();
    expect(values).toEqual([]);
  });

  it('should handle size correctly', async () => {
    expect(await set.size()).toBe(0);

    await set.add('value1');
    await set.add('value2');
    expect(await set.size()).toBe(2);

    await set.delete('value1');
    expect(await set.size()).toBe(1);
  });

  it('should retrieve all values correctly', async () => {
    await set.add('value1');
    await set.add('value2');
    await set.add('value3');

    const values = await set.values();
    expect(values.sort()).toEqual(['value1', 'value2', 'value3'].sort());
  });
});
