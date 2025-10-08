import { describe, it, beforeAll } from 'vitest';
import { readEnv } from '../../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../../../infra/redis/redis.client.js';
import { dummyLiveDto } from '../../../live/spec/live.dto.schema.dummy.js';

describe.skip('StdlRedisImpl', () => {
  let client: StdlRedisImpl;

  const location = 'local';
  const exSec = 3600 * 24;

  beforeAll(async () => {
    const env = readEnv();
    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    client = new StdlRedisImpl(master, replica, exSec, location, location);
  });

  it('set', async () => {
    await client.createLiveState(dummyLiveDto());
    const liveIds = await client.getLivesIds(true);
    console.log(liveIds);
  });

  it('get', async () => {
    console.log(await client.getLiveState('', true));
  });

  it('getLivesIds', async () => {
    const liveIds = await client.getLivesIds(true);
    console.log(liveIds);
  });

  it('getSuccessSegNums', async () => {
    const liveId = '';
    const nums = await client.getSegNums(liveId, 'success', true);
    console.log(nums);
  });
});
