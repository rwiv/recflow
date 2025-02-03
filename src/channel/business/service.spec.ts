import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { ChannelPriority, ChannelUpdate } from '../persistence/channel.types.js';
import { ChannelService } from './channel.service.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { dropAll } from '../../infra/db/utils.js';
import { assertNotNull } from '../../utils/null.js';
import { mockChannel } from '../helpers/mocks.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelQueryRepository } from '../persistence/channel.repository.query.js';

const tagRepo = new TagRepository();
const chanRepo = new ChannelRepository(tagRepo);
const chanQueryRepo = new ChannelQueryRepository(tagRepo);
const chanService = new ChannelService(chanRepo, chanQueryRepo, tagRepo);

describe('ChannelService', () => {
  beforeEach(async () => {
    await dropAll();
  });

  afterAll(async () => {
    await dropAll();
  });

  it('create', async () => {
    const channel = await chanService.create(mockChannel(1), ['tag1', 'tag2']);
    expect(channel.id).toBeDefined();
    expect(channel.tags).toHaveLength(2);
  });

  it('update', async () => {
    const channel = await chanService.create(mockChannel(1), ['tag1', 'tag2']);
    const req: ChannelUpdate = {
      id: channel.id,
      form: {
        description: 'new desc',
      },
    };
    await chanService.update(req, ['tag2', 'tag3', 'tag4']);
    const updated = assertNotNull(await chanService.findById(channel.id, true));
    expect(updated.description).toBe('new desc');
    expect(updated.tags).toHaveLength(3);
  });

  it('delete', async () => {
    const channel = await chanService.create(mockChannel(1), ['tag1', 'tag2']);
    await chanService.delete(channel.id);
    expect(await chanService.findById(channel.id)).toBeUndefined();
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

    const result = await chanService.findByQuery(1, 20, sorted, prioirty, tagName, true);
    // const result = await chanService.findByAnyTag(tagNames, 1, 20, sorted, prioirty, true);
    // const result = await chanService.findByAllTags(tagNames, sorted, prioirty, true);
    console.log(result.map((r) => r.username));

    const all = await chanService.findAll(true);
    for (const r of all) {
      console.log(`${r.username}: [${r.tags?.map((t) => t.name).join(',')}]`);
    }
  });
});

function add(n: number, priority: ChannelPriority, followerCnt: number, tagNames: string[]) {
  return chanService.create(mockChannel(n, priority, followerCnt), tagNames);
}
