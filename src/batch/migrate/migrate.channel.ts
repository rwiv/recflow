import { BatchMigrator } from './migrate.abstract.js';
import { log } from 'jslog';
import { ChannelAppend } from '../../channel/spec/channel.dto.schema.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';

const fetchedTag = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});
const fetchedChannel = z.object({
  id: uuid,
  pid: z.string().nonempty(),
  username: z.string().nonempty(),
  profileImgUrl: z.string().nullable(),
  followerCnt: z.number().nonnegative(),
  followed: z.boolean(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  platformName: platformNameEnum,
  priorityName: z.string().nonempty(),
  tags: z.array(fetchedTag).optional(),
});
type FetchedChannel = z.infer<typeof fetchedChannel>;

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
      createdAt: new Date(channel.createdAt),
      updatedAt: new Date(channel.updatedAt),
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
      const channels = await this.fetchChannels(endpoint, page, pageSize);
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

  private async fetchChannels(endpoint: string, page: number, pageSize: number) {
    const url = `${endpoint}/api/channels?p=${page}&s=${pageSize}&wt=true`;
    const res = await fetch(url);
    return (await res.json()) as FetchedChannel[];
  }
}
