import { BatchMigrator } from './migrate.abstract.js';
import { log } from 'jslog';
import { ChannelAppend, channelDto, priorityDto } from '../../channel/spec/channel.dto.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';
import { tagDto } from '../../channel/spec/tag.dto.schema.js';
import { nonempty } from '../../common/data/common.schema.js';

const fetchedChannel = channelDto.omit({ isFollowed: true }).extend({
  id: nonempty,
  followed: z.boolean(),
  platform: platformDto.extend({ id: nonempty }),
  priority: priorityDto.extend({ id: nonempty }).omit({ shouldNotify: true }),
  tags: z.array(tagDto.extend({ id: nonempty })).optional(),
});
const fetchedChannelsResult = z.object({
  total: z.number().int().nonnegative(),
  channels: z.array(fetchedChannel),
});
export type FetchedChannelsResult = z.infer<typeof fetchedChannelsResult>;

@Injectable()
export class ChannelBatchMigrator extends BatchMigrator {
  constructor(private readonly chWriter: ChannelWriter) {
    super();
  }

  override async migrateOne(line: string): Promise<void> {
    const chan = fetchedChannel.parse(JSON.parse(line));
    const channel = fetchedChannel.parse(chan);
    const req: ChannelAppend = {
      ...channel,
      id: undefined, // TODO: remove
      isFollowed: channel.followed,
      platformName: channel.platform.name,
      priorityName: channel.priority.name,
    };
    // const tagIds = channel.tags?.map((t) => t.id) ?? [];
    // await this.chWriter.createWithTagIds(req, tagIds);
    const tagNames = channel.tags?.map((t) => t.name) ?? [];
    await this.chWriter.createWithTagNames(req, tagNames);
  }

  override async backupRun(endpoint: string, writeLine: (line: string) => Promise<void>) {
    let cnt = 0;
    let page = 1;
    const pageSize = 100;
    while (true) {
      const channels = (await this.fetchChannels(endpoint, page, pageSize)).channels;
      for (const channel of channels) {
        const json = JSON.stringify(channel);
        await writeLine(json);
        cnt++;
      }
      if (channels.length === 0) break;
      page++;
    }
    log.info(`Backing up ${cnt} channels...`);
  }

  async fetchChannels(endpoint: string, page: number, pageSize: number) {
    const url = `${endpoint}/api/channels?p=${page}&s=${pageSize}&wt=true`;
    const res = await fetch(url);
    return fetchedChannelsResult.parse(await res.json());
  }
}
