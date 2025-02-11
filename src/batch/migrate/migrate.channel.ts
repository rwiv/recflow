import { BatchMigrator } from './migrate.abstract.js';
import { log } from 'jslog';
import { ChannelAppend } from '../../channel/channel/business/channel.business.schema.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { platformTypeEnum } from '../../platform/storage/platform.business.schema.js';

const tagRecordFetched = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});
const channelRecordFetched = z.object({
  id: uuid,
  pid: z.string().nonempty(),
  username: z.string().nonempty(),
  profileImgUrl: z.string().nullable(),
  followerCnt: z.number().nonnegative(),
  followed: z.boolean(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  platformName: platformTypeEnum,
  priorityName: z.string().nonempty(),
  tags: z.array(tagRecordFetched).optional(),
});
type ChannelRecordFetched = z.infer<typeof channelRecordFetched>;

@Injectable()
export class ChannelBatchMigrator extends BatchMigrator {
  constructor(private readonly chWriter: ChannelWriter) {
    super();
  }

  override async migrateOne(line: string): Promise<void> {
    const chan = channelRecordFetched.parse(JSON.parse(line));
    const channel = channelRecordFetched.parse(chan);
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
    return (await res.json()) as ChannelRecordFetched[];
  }
}
