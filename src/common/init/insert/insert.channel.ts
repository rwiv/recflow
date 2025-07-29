import fs from 'fs';
import { faker } from '@faker-js/faker';
import { ChannelInfo } from '../../../platform/spec/wapper/channel.js';
import { ChannelWriter } from '../../../channel/service/channel.writer.js';
import { randomElem, shuffleArray } from '../../../utils/list.js';
import { randomInt } from '../../../utils/random.js';
import { ChannelAppend, channelAppend } from '../../../channel/spec/channel.dto.schema.js';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { Injectable } from '@nestjs/common';
import { readBatchConfig } from './insert.config.js';
import { DevNodeInserter } from './insert.node.js';
import { DevCriterionInserter } from './insert.criterion.js';
import { PlatformFinder } from '../../../platform/storage/platform.finder.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { PriorityService } from '../../../channel/service/priority.service.js';
import { PlatformName } from '../../../platform/spec/storage/platform.enum.schema.js';

@Injectable()
export class DevChannelInserter {
  constructor(
    private readonly channelWriter: ChannelWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly nodeInserter: DevNodeInserter,
    private readonly criterionInserter: DevCriterionInserter,
    private readonly pfFinder: PlatformFinder,
    private readonly priService: PriorityService,
  ) {}

  async insertTestNodes(confPath: string) {
    const conf = readBatchConfig(confPath);
    await this.nodeInserter.insert(conf.nodes);
    await this.criterionInserter.insert(conf.criteria);
  }

  async writeTestChannelInfosFile(confPath: string, testChanPath: string) {
    const conf = readBatchConfig(confPath);
    const pairs: [PlatformName, string][] = [];
    for (const batchInfo of conf.channels) {
      for (const pid of batchInfo.pids) {
        pairs.push([batchInfo.platform, pid]);
      }
    }
    const promises = [];
    for (const pair of shuffleArray(pairs)) {
      promises.push(await this.fetcher.fetchChannelNotNull(pair[0], pair[1], false));
    }
    const infos = await Promise.all(promises);
    await fs.promises.writeFile(testChanPath, JSON.stringify(infos, null, 2));
  }

  async insertTestChannels(testChanPath: string) {
    const text = await fs.promises.readFile(testChanPath, 'utf8');
    const infos = JSON.parse(text) as ChannelInfo[];
    const platforms = await this.pfFinder.findAll();
    const priorities = await this.priService.findAll();
    for (const info of infos) {
      const tags: string[] = [];
      for (let i = 1; i < 10; i++) tags.push(`tag${i}`);
      const tagNames = Array.from({ length: randomInt(0, 4) }, () => randomElem(tags));
      const platformId = platforms.find((pf) => pf.name === info.platform)?.id;
      if (!platformId) throw NotFoundError.from('Platform', 'name', info.platform);
      const append: ChannelAppend = {
        ...info,
        platformId,
        priorityId: faker.helpers.arrayElement(priorities.map((p) => p.id)),
        isFollowed: false,
        description: null,
      };
      await this.channelWriter.createWithTagNames(channelAppend.parse(append), Array.from(new Set(tagNames)).sort());
    }
  }
}
