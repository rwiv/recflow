import fs from 'fs';
import { ChannelWriter } from '../channel/business/channel.writer.js';
import { log } from 'jslog';
import { channelRecord, chAppend } from '../channel/business/channel.schema.js';
import { AppInitializer } from '../common/initializer.js';
import { z } from 'zod';

const channelRecordJson = channelRecord.omit({ createdAt: true, updatedAt: true }).extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ChannelJsonRecord = z.infer<typeof channelRecordJson>;

const channelBackupRecord = channelRecordJson
  .omit({ tags: true })
  .extend({ tagNames: z.array(z.string().nonempty()) });
export type ChannelBackupRecord = z.infer<typeof channelBackupRecord>;

export class BatchMigrator {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly init: AppInitializer,
  ) {}

  async migrateChannels(filePath: string) {
    await this.init.initProd();
    const text = await fs.promises.readFile(filePath, 'utf8');
    const channels = JSON.parse(text) as ChannelBackupRecord[];
    for (const channel of channels) {
      const req = chAppend.parse({
        ...channel,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
      });
      await this.chWriter.create(req, channel.tagNames);
      log.info(`Migrated channel: ${channel.username}`);
    }
    log.info(`Migrated ${channels.length} channels`);
  }

  async backupChannels(filePath: string, endpoint: string) {
    const channels = await this.fetchAllChannels(endpoint);
    log.info(`Backing up ${channels.length} channels...`);
    const backupChannels = channels.map((c) => this.recordToBatchDate(c));
    const json = JSON.stringify(backupChannels, null, 2);
    await fs.promises.writeFile(filePath, json);
    log.info(`Writing backup to ${filePath}`);
  }

  private async fetchChannels(endpoint: string, page: number, pageSize: number) {
    const url = `${endpoint}/api/channels?p=${page}&s=${pageSize}&wt=true`;
    const res = await fetch(url);
    const json = (await res.json()) as ChannelJsonRecord[];
    return json.map((c) => this.recordToBatchDate(c));
  }

  private async fetchAllChannels(endpoint: string) {
    let page = 1;
    const pageSize = 100;
    const allChannels: ChannelBackupRecord[] = [];
    while (true) {
      const channels = await this.fetchChannels(endpoint, page, pageSize);
      if (channels.length === 0) break;
      allChannels.push(...channels);
      page++;
    }
    return allChannels;
  }

  private recordToBatchDate(ch: ChannelJsonRecord): ChannelBackupRecord {
    const tagNames = [];
    if (ch.tags) {
      for (const t of ch.tags) tagNames.push(t.name);
    }
    const data: ChannelBackupRecord = { ...ch, tagNames };
    return channelBackupRecord.parse(data);
  }
}
