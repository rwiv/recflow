import { it } from 'vitest';
import { ChannelCreation } from '../persistence/types.js';
import { ChannelService } from './channel.service.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { dropAll } from '../../infra/db/utils.js';

const tagRepo = new TagRepository();
const chanRepo = new ChannelRepository(tagRepo);
const chanService = new ChannelService(chanRepo, tagRepo);

it('test', async () => {
  const channel1 = await chanService.create(mockChannel(1), ['tag1', 'tag2']);

  const channel2 = await chanService.create(mockChannel(2), ['tag2', 'tag3']);

  // console.log(await chRepo.findById(channel1.id, true));
  for (const channel of await chanService.findAll(true)) {
    console.log(channel);
  }

  await dropAll();
});

it('drop all tables', async () => {
  await dropAll();
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
