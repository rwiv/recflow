import fs from 'fs';
import path from 'path';
import { ChannelInfo } from '../../../platform/spec/wapper/channel.js';
import { ChannelWriter } from '../../../channel/service/channel.writer.js';
import { randomElem } from '../../../utils/list.js';
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

@Injectable()
export class DevChannelInserter {
  private readonly testChannelFilePath: string;
  constructor(
    private readonly channelWriter: ChannelWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly nodeInserter: DevNodeInserter,
    private readonly criterionInserter: DevCriterionInserter,
    private readonly pfFinder: PlatformFinder,
    private readonly priService: PriorityService,
  ) {
    this.testChannelFilePath = path.join('dev', 'test_channel_infos.json');
  }

  async insertTestNodes() {
    const conf = readBatchConfig(path.join('dev', 'batch_conf.yaml'));
    await this.nodeInserter.insert(conf.nodes);
    await this.criterionInserter.insert(conf.criteria);
  }

  async writeTestChannelInfosFile(confPath: string) {
    const conf = readBatchConfig(confPath);
    const infos = [];
    for (const id of conf.channels.pids) {
      infos.push(await this.fetcher.fetchChannelNotNull('chzzk', id, false));
    }
    await fs.promises.writeFile(this.testChannelFilePath, JSON.stringify(infos, null, 2));
  }

  async insertTestChannels() {
    const text = await fs.promises.readFile(this.testChannelFilePath, 'utf8');
    const infos = JSON.parse(text) as ChannelInfo[];
    const platforms = await this.pfFinder.findAll();
    const priorities = await this.priService.findAll();
    for (const info of infos) {
      const tags: string[] = [];
      for (let i = 1; i < 10; i++) tags.push(`tag${i}`);
      const tagNames = Array.from({ length: randomInt(0, 7) }, () => randomElem(tags));
      const platformId = platforms.find((pf) => pf.name === info.platform)?.id;
      if (!platformId) throw NotFoundError.from('Platform', 'name', info.platform);
      const priorityId = priorities.find((pri) => pri.name === 'skip')?.id;
      if (!priorityId) throw NotFoundError.from('Priority', 'name', 'skip');
      const append: ChannelAppend = {
        ...info,
        platformId,
        priorityId,
        // isFollowed: randomElem([true, false] as const),
        isFollowed: false,
        description: null,
      };
      await this.channelWriter.createWithTagNames(channelAppend.parse(append), Array.from(new Set(tagNames)).sort());
    }
  }
}
