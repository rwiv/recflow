import { describe, it, beforeEach, afterAll, expect } from 'vitest';
import { ChannelCreation, ChannelUpdate } from '../persistence/channel.types.js';
import { ChannelService } from './channel.service.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { dropAll } from '../../infra/db/utils.js';
import { assertNotNull } from '../../utils/null.js';

const tagRepo = new TagRepository();
const chanRepo = new ChannelRepository(tagRepo);
const chanService = new ChannelService(chanRepo, tagRepo);

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
});

function mockChannel(n: number): ChannelCreation {
  return {
    ptype: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    description: 'desc',
    followerCount: 10,
    priority: 'main',
  };
}
