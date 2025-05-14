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
};

it('test set', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis);
  await client.set(state);
  const liveIds = await client.getLivesIds();
  console.log(liveIds);
});

it('test get', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis);
  console.log(await client.getLive(''));
});

it('test getLivesIds', async () => {
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis);
  const liveIds = await client.getLivesIds();
  console.log(liveIds);
});

it('test getSuccessSegNums', async () => {
  const liveId = '';
  const redis = await createRedisClient(env.stdlRedis);
  const client = new StdlRedisImpl(redis);
  const nums = await client.getSuccessSegNums(liveId);
  console.log(nums);
});
