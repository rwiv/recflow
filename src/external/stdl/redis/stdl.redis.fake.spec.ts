import { describe, it, afterEach } from 'vitest';
import { StdlRedisFake } from './stdl.redis.fake.js';
import { dummyLiveDto } from '../../../live/spec/live.dto.schema.dummy.js';

describe('StdlRedisFake', () => {
  const client = new StdlRedisFake('local');

  afterEach(() => {
    client.clear();
  });

  it('set', async () => {
    const live = dummyLiveDto();
    await client.createLiveState(live);
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
