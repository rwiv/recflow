import fs from 'fs';
import path from 'path';
import { readTestConf } from '../helpers/helper.configs.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { randomElem } from '../../utils/list.js';
import { randomInt } from '../../utils/random.js';
import { CHANNEL_PRIORITIES } from '../../channel/priority/priority.constants.js';
import { ChannelAppend, chAppend } from '../../channel/channel/business/channel.business.schema.js';
import { NodeWriter } from '../../node/business/node.writer.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';

export class DevInitInjector {
  constructor(
    private readonly channelWriter: ChannelWriter,
    private readonly nodeWriter: NodeWriter,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async writeTestChannelInfos() {
    const conf = await readTestConf();
    const infos = [];
    for (const id of conf.channelIds) {
      infos.push(await this.fetcher.fetchChannel('chzzk', id, false));
    }
    await fs.promises.writeFile(
      path.join('dev', 'test_channel_infos.json'),
      JSON.stringify(infos, null, 2),
    );
  }

  async readTestChannelInfos() {
    const text = await fs.promises.readFile(path.join('dev', 'test_channel_infos.json'), 'utf8');
    return JSON.parse(text) as ChannelInfo[];
  }

  async insertTestChannels() {
    const infos = await this.readTestChannelInfos();
    for (const info of infos) {
      const tags: string[] = [];
      for (let i = 1; i < 10; i++) tags.push(`tag${i}`);
      const tagNames = Array.from({ length: randomInt(0, 7) }, () => randomElem(tags));

      const append: ChannelAppend = {
        ...info,
        platformName: info.platform,
        priorityName: randomElem(CHANNEL_PRIORITIES),
        // followed: randomElem([true, false] as const),
        followed: false,
        description: null,
      };
      await this.channelWriter.create(chAppend.parse(append), Array.from(new Set(tagNames)).sort());
    }
  }
}
