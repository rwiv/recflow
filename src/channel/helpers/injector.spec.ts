import { it } from 'vitest';
import { TestChannelInjector } from './injector.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { ChannelQueryRepository } from '../persistence/channel.repository.query.js';
import { ChannelService } from '../business/channel.service.js';

const tagRepo = new TagRepository();
const chanRepo = new ChannelRepository(tagRepo);
const chanQueryRepo = new ChannelQueryRepository(tagRepo);
const chanService = new ChannelService(chanRepo, chanQueryRepo, tagRepo);
const injector = new TestChannelInjector(chanService);

it('test readTestChannelInfos', async () => {
  const infos = await injector.readTestChannelInfos();
  for (const info of infos) {
    console.log(info.username);
  }
});

// it('test writeTestChannelInfos', async () => {
//   await injector.writeTestChannelInfos();
// });
