import { it } from 'vitest';
import path from 'path';
import { TestChannelInjector } from './injector.js';
import { getChannelServies } from './utils.js';

const { chanWriter } = getChannelServies();
const injector = new TestChannelInjector(chanWriter);

it('test readTestChannelInfos', async () => {
  const infos = await injector.readTestChannelInfos();
  for (const info of infos) {
    console.log(info.username);
  }
});

// it('test writeTestChannelInfos', async () => {
//   await injector.writeTestChannelInfos();
// });
