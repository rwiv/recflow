import { it } from 'vitest';
import { DevInitInjector } from './injector.js';
import { getChannelServices } from './channel.deps.js';

const { chWriter } = getChannelServices();
const injector = new DevInitInjector(chWriter);

it('test readTestChannelInfos', async () => {
  const infos = await injector.readTestChannelInfos();
  for (const info of infos) {
    console.log(info.username);
  }
});

// it('test writeTestChannelInfos', async () => {
//   await injector.writeTestChannelInfos();
// });
