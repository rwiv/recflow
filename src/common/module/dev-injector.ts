import fs from 'fs';
import path from 'path';
import { ChannelInfo } from '../../platform/data/wapper/channel.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { randomElem } from '../../utils/list.js';
import { randomInt } from '../../utils/random.js';
import { ChannelAppend, channelAppend } from '../../channel/channel/business/channel.business.schema.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { Injectable } from '@nestjs/common';
import { readBatchConfig } from '../../batch/batch.config.js';
import { NodeBatchInserter } from '../../batch/insert/insert.node.js';
import { CriterionBatchInserter } from '../../batch/insert/insert.criterion.js';

@Injectable()
export class DevInitInjector {
  private readonly testChannelFilePath: string;
  constructor(
    private readonly channelWriter: ChannelWriter,
    private readonly fetcher: PlatformFetcher,
    private readonly nodeInserter: NodeBatchInserter,
    private readonly criterionInserter: CriterionBatchInserter,
  ) {
    this.testChannelFilePath = path.join('dev', 'test_channel_infos.json');
  }

  async insertTestNodes() {
    const conf = readBatchConfig(path.join('dev', 'batch_conf.yaml'));
    await this.nodeInserter.insert(conf.nodes);
    await this.criterionInserter.insert(conf.criteria);
  }

  // async insertTestNodes() {
  //   const groups = await this.groupRepo.findAll();
  //   if (groups.length === 0) {
  //     throw new FatalError('No node group found');
  //   }
  //   for (let i = 0; i < 5; i++) {
  //     const append: NodeAppend = {
  //       name: `test${i}`,
  //       groupId: groups[randomInt(0, groups.length - 1)].id,
  //       typeName: randomElem(nodeType.options),
  //       endpoint: 'http://localhost:3000',
  //       weight: randomInt(1, 2),
  //       totalCapacity: 10,
  //       capacities: [
  //         { platformName: 'chzzk', capacity: 10 },
  //         { platformName: 'soop', capacity: 10 },
  //         { platformName: 'twitch', capacity: 0 },
  //       ],
  //     };
  //     await this.nodeWriter.create(nodeAppend.parse(append));
  //   }
  // }

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
    for (const info of infos) {
      const tags: string[] = [];
      for (let i = 1; i < 10; i++) tags.push(`tag${i}`);
      const tagNames = Array.from({ length: randomInt(0, 7) }, () => randomElem(tags));
      const append: ChannelAppend = {
        ...info,
        platformName: info.platform,
        // priorityName: randomElem(CHANNEL_PRIORITIES),
        priorityName: 'skip',
        // followed: randomElem([true, false] as const),
        followed: false,
        description: null,
      };
      await this.channelWriter.createWithTagNames(
        channelAppend.parse(append),
        Array.from(new Set(tagNames)).sort(),
      );
    }
  }
}
