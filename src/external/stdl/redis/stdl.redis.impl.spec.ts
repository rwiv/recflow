import { describe, it, beforeAll } from 'vitest';
import { RedisClientType } from 'redis';
import { readEnv } from '../../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../../../infra/redis/redis.client.js';
import { LiveState } from './stdl.redis.js';

describe.skip('', () => {
  let master: RedisClientType;
  let replica: RedisClientType;

  beforeAll(async () => {
    const env = readEnv();
    master = await createRedisClient(env.stdlRedisMaster);
    replica = await createRedisClient(env.stdlRedisReplica);
  });

  const location = 'local';
  const fsName = 'none';
  const exSec = 3600 * 24;

  it('set', async () => {
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
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
    await client.set(state);
    const liveIds = await client.getLivesIds(true);
    console.log(liveIds);
  });

  it('get', async () => {
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    console.log(await client.getLiveState('b23eafac-4790-496b-8f9c-b928252da10f', true));
  });

  it('getLivesIds', async () => {
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    const liveIds = await client.getLivesIds(true);
    console.log(liveIds);
  });

  it('getSuccessSegNums', async () => {
    const liveId = '';
    const client = new StdlRedisImpl(master, replica, exSec, location, location, fsName);
    const nums = await client.getSegNums(liveId, 'success', true);
    console.log(nums);
  });
});
