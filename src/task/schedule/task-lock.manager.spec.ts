import { it, expect } from 'vitest';
import { TaskLockManager } from './task-lock.manager.js';
import { readEnv } from '../../common/config/env.js';
import { createIoRedisClient } from '../../infra/redis/redis.client.js';
import assert from 'assert';

const env = readEnv();

it('test TaskLockManager', async () => {
  const taskName = 'foo';
  const redis = createIoRedisClient(env.serverRedis, 1);

  const lm = new TaskLockManager(redis);

  expect(await lm.release(taskName, 'asd')).toBeNull();

  const token = await lm.acquire(taskName, 10);
  expect(token).not.toBeNull();
  assert(token);

  expect(await lm.release(taskName, 'asd')).not.toBeTruthy();
  expect(await lm.release(taskName, token)).toBeTruthy();
});
