import { describe, it } from 'vitest';
import { readEnv } from '../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../redis/redis.client.js';
import { LiveState } from './stdl.redis.js';

describe.skip('', () => {
  const env = readEnv();

  const location = 'local';
  const fsName = 'none';

  const state: LiveState = {
    id: '{id}',
    platform: 'chzzk',
    channelId: '{channelId}',
    channelName: 'asd',
    liveId: 'asd',
    liveTitle: 'asd',
    platformCookie: null,
    streamUrl: 'asd',
    streamParams: null,
    streamHeaders: {},
    videoName: '{videoName}',
    fsName,
    location: location,
    isInvalid: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const exSec = 3600 * 24;

  it('set', async () => {
    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    await client.set(state);
    const liveIds = await client.getLivesIds(true);
    console.log(liveIds);
  });

  it('get', async () => {
    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    console.log(await client.getLiveState('b23eafac-4790-496b-8f9c-b928252da10f', true));
  });

  it('getLivesIds', async () => {
    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    const liveIds = await client.getLivesIds(true);
    console.log(liveIds);
  });

  it('getSuccessSegNums', async () => {
    const liveId = '';
    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    const nums = await client.getSegNums(liveId, 'success', true);
    console.log(nums);
  });
});
