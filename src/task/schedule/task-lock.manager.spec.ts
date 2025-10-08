import { describe, it, expect, beforeAll } from 'vitest';
import { TaskLockManager } from './task-lock.manager.js';
import { readEnv } from '../../common/config/env.js';
import { createIoRedisClient } from '../../utils/redis.js';
import assert from 'assert';

describe.skip('TaskLockManager', () => {
  let lm: TaskLockManager;

  beforeAll(() => {
    const redis = createIoRedisClient(readEnv().serverRedis, 1);
    lm = new TaskLockManager(redis);
  });

  const taskName = 'foo';

  it('test TaskLockManager', async () => {
    expect(await lm.release(taskName, 'asd')).toBeNull();

    const token = await lm.acquire(taskName, 10);
    expect(token).not.toBeNull();
    assert(token);

    expect(await lm.get(taskName)).toBe(token);

    expect(await lm.release(taskName, 'asd')).not.toBeTruthy();
    expect(await lm.release(taskName, token)).toBeTruthy();
  });
});
