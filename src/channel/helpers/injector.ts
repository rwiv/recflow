import fs from 'fs';
import path from 'path';
import { readTestConf } from '../../common/helpers.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { ChannelService } from '../business/channel.service.js';
import { ChannelCreation } from '../persistence/channel.types.js';

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
        priority: 'must',
        description: null,
      };
      await this.channelService.create(req, ['tag1', 'tag2']);
    }
  }
}
