import { it } from 'vitest';
import { DevInitInjector } from './dev-injector.js';
import { createTestApp } from '../helpers/helper.app.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { NodeWriter } from '../../node/business/node.writer.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';

const app = await createTestApp();
const chWriter = app.get(ChannelWriter);
const nodeWriter = app.get(NodeWriter);
const fetcher = app.get(PlatformFetcher);
const injector = new DevInitInjector(chWriter, nodeWriter, fetcher);

it('test readTestChannelInfos', async () => {
  const infos = await injector.readTestChannelInfos();
  for (const info of infos) {
    console.log(info.username);
  }
});

// it('test writeTestChannelInfos', async () => {
//   await injector.writeTestChannelInfos();
// });
