import { it } from 'vitest';
import { ChannelCreation } from './types.js';
import { channels, channelsToTags, tags } from '../persistence/schema.js';
import { db } from '../../infra/db/db.js';
import { ChannelService } from './channel.service.js';
import { TagService } from './tag.service.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { ChannelRepository } from '../persistence/channel.repository.js';

const tagRepo = new TagRepository();
const chanRepo = new ChannelRepository();
const tagService = new TagService(tagRepo, chanRepo);
const chanService = new ChannelService(chanRepo, tagRepo);

it('test', async () => {
  const channel1 = await chanService.create(mockChannel(1));
  await tagService.attach(channel1.id, 'tag1');
  await tagService.attach(channel1.id, 'tag2');

  const channel2 = await chanService.create(mockChannel(2));
  await tagService.attach(channel2.id, 'tag2');
  await tagService.attach(channel2.id, 'tag3');

  // console.log(await chRepo.findById(channel1.id, true));
  for (const channel of await chanService.findAll(true)) {
    console.log(channel);
  }

  await db.delete(channelsToTags);
  await db.delete(tags);
  await db.delete(channels);
});

it('clear', async () => {
  await db.delete(channelsToTags);
  await db.delete(tags);
  await db.delete(channels);
});

function mockChannel(n: number): ChannelCreation {
  return {
    ptype: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    description: 'desc',
    followerCount: 10,
    priority: 'main',
  };
}
