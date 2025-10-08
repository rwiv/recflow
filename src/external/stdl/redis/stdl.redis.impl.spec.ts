import { describe, it, expect, beforeAll } from 'vitest';
import { readEnv } from '../../../common/config/env.js';
import { StdlRedisImpl } from './stdl.redis.impl.js';
import { createRedisClient } from '../../../infra/redis/redis.client.js';
import { dummyLiveDto } from '../../../live/spec/live.dto.schema.dummy.js';

describe.skip('StdlRedisImpl', () => {
  let client: StdlRedisImpl;

  const _ = true;
  const location = 'local';
  const exSec = 3600 * 24;

  beforeAll(async () => {
    const env = readEnv();
    const master = await createRedisClient(env.stdlRedisMaster);
    const replica = await createRedisClient(env.stdlRedisReplica);
    client = new StdlRedisImpl(master, replica, exSec, location, location);
  });

  it('liveState', async () => {
    // When
    const ls1 = await client.createLiveState(dummyLiveDto());
    const ls2 = await client.createLiveState(dummyLiveDto());

    // Then
    expect(await client.getLiveState('not', _)).toEqual(null);
    expect(await client.getLiveState(ls1.id, _)).toEqual(ls1);
    expect(await client.getLiveStates([ls1.id, ls2.id], _)).toEqual([ls1, ls2]);
    expect(await client.getLivesIds(_)).toEqual([ls1.id, ls2.id]);

    // When
    await client.deleteLiveState(ls1.id);

    // Then
    expect(await client.getLiveState(ls1.id, _)).toEqual(null);
    expect(await client.getLivesIds(_)).toEqual([ls2.id]);

    // Clear
    await client.deleteLiveState(ls2.id);
  });
});
