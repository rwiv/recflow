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
import { nodeAppend, NodeAppend } from '../../node/business/node.business.schema.js';
import { NodeGroupRepository } from '../../node/persistence/node-group.repository.js';
import { FatalError } from '../../utils/errors/errors/FatalError.js';
import { Injectable } from '@nestjs/common';
import { nodeTypeEnum } from '../../node/node.schema.js';

@Injectable()
export class DevInitInjector {
  private readonly testChannelFilePath: string;
  constructor(
    private readonly channelWriter: ChannelWriter,
    private readonly nodeWriter: NodeWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly groupRepo: NodeGroupRepository,
  ) {
    this.testChannelFilePath = path.join('dev', 'test_channel_infos.json');
  }

  async insertTestNodes() {
    const groups = await this.groupRepo.findAll();
    if (groups.length === 0) {
      throw new FatalError('No node group found');
    }
    for (let i = 0; i < 5; i++) {
      const append: NodeAppend = {
        name: `test${i}`,
        groupId: groups[randomInt(0, groups.length - 1)].id,
        typeName: randomElem(nodeTypeEnum.options),
        endpoint: 'http://localhost:3000',
        weight: randomInt(1, 2),
        totalCapacity: 10,
        capacities: [
          { platformName: 'chzzk', capacity: 10 },
          { platformName: 'soop', capacity: 10 },
          { platformName: 'twitch', capacity: 10 },
        ],
      };
      await this.nodeWriter.create(nodeAppend.parse(append));
    }
  }

  async writeTestChannelInfos() {
    const conf = await readTestConf();
    const infos = [];
    for (const id of conf.channelIds) {
      infos.push(await this.fetcher.fetchChannel('chzzk', id, false));
    }
    await fs.promises.writeFile(this.testChannelFilePath, JSON.stringify(infos, null, 2));
  }

  private async readTestChannelInfos() {
    const text = await fs.promises.readFile(this.testChannelFilePath, 'utf8');
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
