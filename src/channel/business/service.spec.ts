import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { ChannelPriority } from '../persistence/channel.types.js';
import { dropAll } from '../../infra/db/utils.js';
import { assertNotNull } from '../../utils/null.js';
import { mockChannel } from '../helpers/mocks.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelUpdate } from './channel.types.js';
import { getChannelServies } from '../helpers/utils.js';

const { chanFinder, chanWriter } = getChannelServies();

describe('ChannelService', () => {
  beforeEach(async () => {
    await dropAll();
  });

  afterAll(async () => {
    await dropAll();
  });

  it('create', async () => {
    const channel = await chanWriter.create(mockChannel(1), ['tag1', 'tag2']);
    console.log(channel);
    expect(channel.id).toBeDefined();
    expect(channel.tags).toHaveLength(2);
  });

  it('update', async () => {
    const channel = await chanWriter.create(mockChannel(1), ['tag1', 'tag2']);
    const req: ChannelUpdate = {
      id: channel.id,
      form: {
        description: 'new desc',
      },
      tagNames: ['tag2', 'tag3', 'tag4'],
    };
    await chanWriter.update(req);
    const updated = assertNotNull(await chanFinder.findById(channel.id, true));
    expect(updated.description).toBe('new desc');
    expect(updated.tags).toHaveLength(3);
  });

  it('delete', async () => {
    const channel = await chanWriter.create(mockChannel(1), ['tag1', 'tag2']);
    await chanWriter.delete(channel.id);
    expect(await chanFinder.findById(channel.id)).toBeUndefined();
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

    const result = await chanFinder.findByQuery(1, 20, sorted, prioirty, tagName, true);
    // const result = await chanService.findByAnyTag(tagNames, 1, 20, sorted, prioirty, true);
    // const result = await chanService.findByAllTags(tagNames, sorted, prioirty, true);
    console.log(result.map((r) => r.username));

    const all = await chanFinder.findAll(true);
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
});

function add(n: number, priority: ChannelPriority, followerCnt: number, tagNames: string[]) {
  return chanWriter.create(mockChannel(n, priority, followerCnt), tagNames);
}
