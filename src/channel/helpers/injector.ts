import fs from 'fs';
import path from 'path';
import { readTestConf } from '../../common/helpers.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { ChannelWriter } from '../business/channel.writer.js';
import { ChannelEntCreation } from '../persistence/channel.types.js';
import { faker } from '@faker-js/faker';
import { CHANNEL_PRIORITIES } from '../priority/consts.js';
import { ChannelCreation } from '../business/channel.types.js';
import { checkType } from '../../utils/union.js';
import { PLATFORM_TYPES } from '../../common/enum.consts.js';
import { log } from 'jslog';
import {randomElem} from "../../utils/list.js";

interface BatchInsertRequest {
  pids: string[];
  platform: string;
  priority: string;
  tagNames: string[];
}

export class TestChannelInjector {
  constructor(private readonly channelWriter: ChannelWriter) {}

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
      const req: ChannelEntCreation = {
        username: info.username,
        profileImgUrl: info.profileImgUrl,
        pid: info.pid,
        followerCnt: info.followerCnt,
        platform: info.platform,
        priority: randomElem(CHANNEL_PRIORITIES),
        // followed: randomElem([true, false] as const),
        followed: false,
        description: faker.lorem.sentence(),
      };

      const tags: string[] = [];
      for (let i = 1; i < 10; i++) {
        tags.push(`tag${i}`);
      }
      const n = faker.number.int({ min: 0, max: 8 });
      const tagNames = Array.from({ length: n }, () => randomElem(tags));
      await this.channelWriter.create(req, Array.from(new Set(tagNames)).sort());
    }
  }

  async batchInsertChannels(filePath: string, delay: number) {
    const text = await fs.promises.readFile(filePath, 'utf8');
    const breq = JSON.parse(text) as BatchInsertRequest;
    const priority = checkType(breq.priority, CHANNEL_PRIORITIES);
    const platform = checkType(breq.platform, PLATFORM_TYPES);
    if (!priority || !platform) {
      throw Error('Invalid priority or platform');
    }
    for (const pid of breq.pids) {
      const req: ChannelCreation = {
        pid,
        platform,
        priority,
        followed: false,
        description: null,
        tagNames: breq.tagNames.filter((t: string) => t.length > 0),
      };
      await this.channelWriter.createWithFetch(req);
      log.info(`Inserted channel ${pid}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
