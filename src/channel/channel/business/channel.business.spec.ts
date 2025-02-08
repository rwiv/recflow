import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { dropAll } from '../../../infra/db/utils.js';
import { mockChannel } from '../../../common/helpers/channel.mocks.js';
import { getChannelServices } from '../../../common/helpers/channel.deps.js';
import { ChannelPriority } from '../../priority/priority.types.js';
import { ChannelSortArg } from './channel.business.schema.js';

const { chFinder, chSearcher, chWriter, init } = getChannelServices();

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
        await add(i, 'should', 100 - i, ['tag4', 'tag5', 'tag10', 'tag11']);
      } else if (i <= 25) {
        await add(i, 'should', 100 - i, ['tag5', 'tag6']);
      } else {
        await add(i, 'may', 100 - i, ['tag4', 'tag5', 'tag12', 'tag13']);
      }
    }

    // const sorted: ChannelSortArg = 'latest';
    const sorted: ChannelSortArg = 'followerCnt';
    // const sorted: ChannelSortArg = undefined;

    // const prioirty = 'should';
    const prioirty = undefined;

    const includes = ['tag4', 'tag5'];
    // const excludes: string[] = [];
    const excludes = ['tag10', 'tag11'];
    // const excludes = ['tag10', 'tag12'];
    // const excludes = ['tag3', 'tag6'];

    const page = { page: 1, size: 20 };

    // const result = await chFinder.findByQuery(page, sorted, prioirty, undefined, true);
    const result = await chSearcher.findByAllTags(includes, excludes, page, sorted, prioirty, true);
    // const result = await chSearcher.findByAnyTag(includes, excludes, page, sorted, prioirty, true);
    console.log(result.total);
    console.log(result.channels.map((r) => r.username));

    const all = await chFinder.findAll(true);
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
});

function add(n: number, priority: ChannelPriority, followerCnt: number, tagNames: string[]) {
  return chWriter.create(mockChannel(n, priority, followerCnt), tagNames);
}
