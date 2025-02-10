import fs from 'fs';
import { ChannelWriter } from '../channel/channel/business/channel.writer.js';
import { log } from 'jslog';
import { ChannelAppend } from '../channel/channel/business/channel.business.schema.js';
import { AppInitializer } from '../common/module/initializer.js';
import { z } from 'zod';
import { uuid } from '../common/data/common.schema.js';
import { platformTypeEnum } from '../platform/platform.schema.js';

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
export type ChannelRecordFetched = z.infer<typeof channelRecordFetched>;

export class BatchMigrator {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly init: AppInitializer,
  ) {}

  async migrateChannels(filePath: string) {
    await this.init.initProd();
    const text = await fs.promises.readFile(filePath, 'utf8');
    const channels = JSON.parse(text) as ChannelRecordFetched[];
    for (const chan of channels) {
      const channel = channelRecordFetched.parse(chan);
      const req: ChannelAppend = {
        ...channel,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
      };
      const tagIds = channel.tags?.map((t) => t.id) ?? [];
      await this.chWriter.createWithTagIds(req, tagIds);
      log.info(`Migrated channel: ${channel.username}`);
    }
    log.info(`Migrated ${channels.length} channels`);
  }

  async backupChannels(filePath: string, endpoint: string) {
    const channels = await this.fetchAllChannels(endpoint);
    log.info(`Backing up ${channels.length} channels...`);
    const json = JSON.stringify(channels, null, 2);
    await fs.promises.writeFile(filePath, json);
    log.info(`Writing backup to ${filePath}`);
  }

  private async fetchAllChannels(endpoint: string) {
    let page = 1;
    const pageSize = 100;
    const allChannels: ChannelRecordFetched[] = [];
    while (true) {
      const channels = await this.fetchChannels(endpoint, page, pageSize);
      if (channels.length === 0) break;
      allChannels.push(...channels);
      page++;
    }
    return allChannels;
  }

  private async fetchChannels(endpoint: string, page: number, pageSize: number) {
    const url = `${endpoint}/api/channels?p=${page}&s=${pageSize}&wt=true`;
    const res = await fetch(url);
    return (await res.json()) as ChannelRecordFetched[];
  }
}
