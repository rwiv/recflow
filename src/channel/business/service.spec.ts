import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { dropAll } from '../../infra/db/utils.js';
import { mockChannel } from '../helpers/mocks.js';
import { getChannelServices } from '../helpers/utils.js';
import { ChannelPriority } from '../priority/types.js';
import { ChannelSortType } from './channel.schema.js';

const { chFinder, chWriter, init } = getChannelServices();

describe('ChannelService', () => {
  beforeEach(async () => {
    await dropAll();
    await init.checkDb();
  });

  afterAll(async () => {
    await dropAll();
  });

  it('create', async () => {
    const channel = await chWriter.create(mockChannel(1), ['tag1', 'tag2']);
    console.log(channel);
    expect(channel.id).toBeDefined();
    expect(channel.tags).toHaveLength(2);
  });

  it('delete', async () => {
    const channel = await chWriter.create(mockChannel(1), ['tag1', 'tag2']);
    await chWriter.delete(channel.id);
    expect(await chFinder.findById(channel.id)).toBeUndefined();
  });

  it('findPage', async () => {
    for (let i = 1; i <= 15; i++) {
      if (i <= 5) {
        await add(i, 'must', 100 - i, ['tag1', 'tag2']);
      } else if (i <= 10) {
        await add(i, 'must', 100 - i, ['tag2', 'tag3']);
      } else {
        await add(i, 'must', 100 - i, ['tag3', 'tag4']);
      }
    }
    for (let i = 16; i <= 30; i++) {
      if (i <= 20) {
        await add(i, 'should', 100 - i, ['tag4', 'tag5']);
      } else if (i <= 25) {
        await add(i, 'should', 100 - i, ['tag5', 'tag6']);
      } else {
        await add(i, 'may', 100 - i, ['tag4', 'tag5']);
      }
    }

    // const sorted: ChannelSortType = 'latest';
    const sorted: ChannelSortType = 'followerCnt';
    // const sorted: ChannelSortType = undefined;

    const prioirty = 'should';
    // const prioirty = undefined;

    const tagName = 'tag5';
    // const tagName = undefined;
    const tagNames = ['tag4', 'tag5'];
    // const tagNames = undefined;

    const result = await chFinder.findByQuery(1, 20, sorted, prioirty, tagName, true);
    // const result = await chanService.findByAnyTag(tagNames, 1, 20, sorted, prioirty, true);
    // const result = await chanService.findByAllTags(tagNames, sorted, prioirty, true);
    console.log(result.map((r) => r.username));

    const all = await chFinder.findAll(true);
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
});

function add(n: number, priority: ChannelPriority, followerCnt: number, tagNames: string[]) {
  return chWriter.create(mockChannel(n, priority, followerCnt), tagNames);
}
