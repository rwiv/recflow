import { it } from 'vitest';
import { TestChannelInjector } from './injector.js';
import { getChannelServices } from './utils.js';

const { chWriter } = getChannelServices();
const injector = new TestChannelInjector(chWriter);

it('test readTestChannelInfos', async () => {
  const infos = await injector.readTestChannelInfos();
  for (const info of infos) {
    console.log(info.username);
  }
});

// it('test writeTestChannelInfos', async () => {
//   await injector.writeTestChannelInfos();
// });
