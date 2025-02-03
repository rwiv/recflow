import fs from 'fs';
import path from 'path';
import { readTestConf } from '../../common/helpers.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { ChannelService } from '../business/channel.service.js';
import { ChannelCreation } from '../persistence/channel.types.js';
import { faker } from '@faker-js/faker';
import { randomElem } from '../../../web/src/lib/list.js';

export class TestChannelInjector {
  constructor(private readonly channelService: ChannelService) {}

  async writeTestChannelInfos() {
    const conf = await readTestConf();
    const fetcher = getFetcher();
    const infos = [];
    for (const id of conf.channelIds) {
      infos.push(await fetcher.fetchChannel('chzzk', id, false));
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
      const req: ChannelCreation = {
        username: info.username,
        profileImgUrl: info.profileImgUrl,
        ptype: info.ptype,
        pid: info.pid,
        followerCnt: info.followerCnt,
        priority: randomElem(['must', 'should', 'may', 'review', 'skip', 'none']),
        description: faker.lorem.sentence(),
      };

      const tags: string[] = [];
      for (let i = 1; i < 10; i++) {
        tags.push(`tag${i}`);
      }
      const n = faker.number.int({ min: 0, max: 8 });
      const tagNames = Array.from({ length: n }, () => randomElem(tags));
      await this.channelService.create(req, Array.from(new Set(tagNames)).sort());
    }
  }
}
