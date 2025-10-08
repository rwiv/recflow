import { describe, it, expect, afterEach } from 'vitest';
import { StdlRedisFake } from './stdl.redis.fake.js';
import { dummyLiveDto } from '../../../live/spec/live.dto.schema.dummy.js';

describe('StdlRedisFake', () => {
  const client = new StdlRedisFake('local');
  const _ = true;

  afterEach(() => {
    client.clear();
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
  });

  it('segNums', async () => {
    // Given
    const kw = 'success';

    // When
    const ls = await client.createLiveState(dummyLiveDto());
    client.setSegNums(ls.id, kw, ['1', '2']);
    expect(await client.getSegNums(ls.id, kw, _)).toEqual(['1', '2']);

    // When
    await client.deleteSegNumSet(ls.id, kw);
    expect(await client.getSegNums(ls.id, kw, _)).toEqual([]);
  });
});
