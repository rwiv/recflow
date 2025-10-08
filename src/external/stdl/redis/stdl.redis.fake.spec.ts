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
    await expect(client.getLiveState('not', _)).resolves.toEqual(null);
    await expect(client.getLiveState(ls1.id, _)).resolves.toEqual(ls1);
    await expect(client.getLiveStates([ls1.id, ls2.id], _)).resolves.toEqual([ls1, ls2]);
    await expect(client.getLivesIds(_)).resolves.toEqual([ls1.id, ls2.id]);

    // When
    await client.deleteLiveState(ls1.id);

    // Then
    await expect(client.getLiveState(ls1.id, _)).resolves.toEqual(null);
    await expect(client.getLivesIds(_)).resolves.toEqual([ls2.id]);
  });

  it('segNums', async () => {
    // Given
    const kw = 'success';

    // When
    const ls = await client.createLiveState(dummyLiveDto());
    client.setSegNums(ls.id, kw, ['1', '2']);
    // Then
    await expect(client.getSegNums(ls.id, kw, _)).resolves.toEqual(['1', '2']);

    // When
    await client.deleteSegNumSet(ls.id, kw);
    // Then
    await expect(client.getSegNums(ls.id, kw, _)).resolves.toEqual([]);
  });
});
