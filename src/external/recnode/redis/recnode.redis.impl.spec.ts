import { describe, it, expect, beforeAll } from 'vitest';
import { readEnv } from '../../../common/config/env.js';
import { RecnodeRedisImpl } from './recnode.redis.impl.js';
import { createRedisClient } from '../../../utils/redis.js';
import { dummyLiveDto } from '../../../live/spec/live.dto.schema.dummy.js';

describe.skip('RecnodeRedisImpl', () => {
  let client: RecnodeRedisImpl;

  const _ = true;
  const location = 'local';
  const exSec = 3600 * 24;

  beforeAll(async () => {
    const env = readEnv();
    const master = await createRedisClient(env.recnodeRedisMaster);
    const replica = await createRedisClient(env.recnodeRedisReplica);
    client = new RecnodeRedisImpl(master, replica, exSec, location, location);
  });

  it('liveState', async () => {
    // When
    const ls1 = await client.createLiveState(dummyLiveDto());
    const ls2 = await client.createLiveState(dummyLiveDto());

    // Then
    await expect(client.getLiveState('not', _)).resolves.toEqual(null);
    await expect(client.getLiveState(ls1.id, _)).resolves.toEqual(ls1);
    await expect(client.getLiveStates([ls1.id, ls2.id], _)).resolves.toEqual([ls1, ls2]);
    await expect(client.getLivesIds(_)).resolves.toEqual([ls1.id, ls2.id]);

    // When
    await client.deleteLiveState(ls1.id);

    // Then
    await expect(client.getLiveState(ls1.id, _)).resolves.toEqual(null);
    await expect(client.getLivesIds(_)).resolves.toEqual([ls2.id]);

    // Clear
    await client.deleteLiveState(ls2.id);
  });
});
