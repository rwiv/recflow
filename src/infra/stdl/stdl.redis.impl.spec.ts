import { it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../redis/redis.client.js';
import { LiveState } from './stdl.redis.js';

const env = readEnv();

const location = 'local';

const state: LiveState = {
  id: '{id}',
  platform: 'chzzk',
  channelId: '{channelId}',
  channelName: 'asd',
  liveId: 'asd',
  liveTitle: 'asd',
  streamUrl: 'asd',
  headers: null,
  videoName: '{videoName}',
  location: location,
  isInvalid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const exSec = 3600 * 24;

it('test set', async () => {
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec, location, location);
  await client.set(state);
  const liveIds = await client.getLivesIds(true);
  console.log(liveIds);
});

it('test get', async () => {
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec, location, location);
  console.log(await client.getLiveState('', true));
});

it('test getLivesIds', async () => {
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec, location, location);
  const liveIds = await client.getLivesIds(true);
  console.log(liveIds);
});

it('test getSuccessSegNums', async () => {
  const liveId = '';
  const master = await createRedisClient(env.stdlRedisMaster);
  const replica = await createRedisClient(env.stdlRedisReplica);
  const client = new StdlRedisImpl(master, replica, exSec, location, location);
  const nums = await client.getSegNums(liveId, 'success', true);
  console.log(nums);
});
