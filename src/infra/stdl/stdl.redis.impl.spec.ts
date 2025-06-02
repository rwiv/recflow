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
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec);
  await client.set(state);
  const liveIds = await client.getLivesIds(true);
  console.log(liveIds);
});

it('test get', async () => {
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec);
  console.log(await client.getLiveState('', true));
});

it('test getLivesIds', async () => {
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec);
  const liveIds = await client.getLivesIds(true);
  console.log(liveIds);
});

it('test getSuccessSegNums', async () => {
  const liveId = '';
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec);
  const nums = await client.getSegNums(liveId, 'success', true);
  console.log(nums);
});
