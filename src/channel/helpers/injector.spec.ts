import { it } from 'vitest';
import { TestChannelInjector } from './injector.js';
import { getServies } from './utils.js';

const { chanCommander } = getServies();
const injector = new TestChannelInjector(chanCommander);

it('test readTestChannelInfos', async () => {
  const infos = await injector.readTestChannelInfos();
  for (const info of infos) {
    console.log(info.username);
  }
});

// it('test writeTestChannelInfos', async () => {
//   await injector.writeTestChannelInfos();
// });
