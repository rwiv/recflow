import fs from 'fs';
import { ChannelFinder } from '../channel/business/channel.finder.js';
import { ChannelWriter } from '../channel/business/channel.writer.js';
import { log } from 'jslog';
import { chAppend } from '../channel/business/channel.schema.js';
import { AppInitializer } from '../common/initializer.js';
import { platformType } from '../common/schema.js';

export interface ChannelBackupRecord {
  id: string;
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platform: string;
  priority: string;
  followed: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export class BatchMigrator {
  constructor(
    private readonly chFinder: ChannelFinder,
    private readonly chWriter: ChannelWriter,
    private readonly init: AppInitializer,
  ) {}

  async migrateChannels(filePath: string) {
    await this.init.initProd();
    const text = await fs.promises.readFile(filePath, 'utf8');
    const channels = JSON.parse(text) as ChannelBackupRecord[];
    for (const channel of channels) {
      const req = chAppend.parse({
        pid: channel.pid,
        platformName: platformType.parse(channel.platform),
        username: channel.username,
        profileImgUrl: channel.profileImgUrl,
        followerCnt: channel.followerCnt,
        priorityName: channel.priority,
        followed: channel.followed,
        description: channel.description,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
      });
      await this.chWriter.create(req, channel.tags);
      log.info(`Migrated channel: ${channel.username}`);
    }
    log.info(`Migrated ${channels.length} channels`);
  }

  async backupChannels(filePath: string) {
    const channels = await this.chFinder.findAll(true);
    log.info(`Backing up ${channels.length} channels...`);
    const backupChannels: ChannelBackupRecord[] = channels.map((c) => {
      const tags = [];
      if (c.tags) {
        for (const t of c.tags) {
          tags.push(t.name);
        }
      }
      return {
        id: c.id,
        pid: c.pid,
        username: c.username,
        profileImgUrl: c.profileImgUrl,
        followerCnt: c.followerCnt,
        platform: c.platformName,
        priority: c.priorityName,
        followed: c.followed,
        description: c.description,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        tags,
      };
    });
    const json = JSON.stringify(backupChannels, null, 2);
    await fs.promises.writeFile(filePath, json);
    log.info(`Writing backup to ${filePath}`);
  }
}
