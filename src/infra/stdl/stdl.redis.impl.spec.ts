import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../redis/redis.client.js';
import { LiveState } from './stdl.redis.js';

const env = readEnv();

const state: LiveState = {
  id: '{id}',
  platform: 'chzzk',
  channelId: '{channelId}',
  channelName: 'asd',
  liveId: 'asd',
  videoName: '{videoName}',
  liveTitle: 'asd',
  streamUrl: 'asd',
  headers: null,
  isInvalid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const exSec = 3600 * 24;

it('test set', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis, exSec);
  await client.set(state);
  const liveIds = await client.getLivesIds();
  console.log(liveIds);
});

it('test get', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis, exSec);
  console.log(await client.getLiveState(''));
});

it('test getLivesIds', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis, exSec);
  const liveIds = await client.getLivesIds();
  console.log(liveIds);
});

it('test getSuccessSegNums', async () => {
  const liveId = '';
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis, exSec);
  const nums = await client.getSuccessSegNums(liveId);
  console.log(nums);
});
