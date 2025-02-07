import fs from 'fs';
import { ChannelFinder } from '../channel/business/channel.finder.js';
import { ChannelWriter } from '../channel/business/channel.writer.js';
import { ChannelEntCreation } from '../channel/persistence/channel.types.js';
import { checkEnum } from '../utils/union.js';
import { PLATFORM_TYPES } from '../common/enum.consts.js';
import { assertNotNull } from '../utils/null.js';
import { CHANNEL_PRIORITIES } from '../channel/priority/consts.js';
import { log } from 'jslog';

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
    private readonly chanFinder: ChannelFinder,
    private readonly chanWriter: ChannelWriter,
  ) {}

  async migrateChannels(filePath: string) {
    const text = await fs.promises.readFile(filePath, 'utf8');
    const channels = JSON.parse(text) as ChannelBackupRecord[];
    for (const channel of channels) {
      const req: ChannelEntCreation = {
        pid: channel.pid,
        platform: assertNotNull(checkEnum(channel.platform, PLATFORM_TYPES)),
        username: channel.username,
        profileImgUrl: channel.profileImgUrl,
        followerCnt: channel.followerCnt,
        priority: assertNotNull(checkEnum(channel.priority, CHANNEL_PRIORITIES)),
        followed: channel.followed,
        description: channel.description,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
      };
      await this.chanWriter.create(req, channel.tags);
      log.info(`Migrated channel: ${channel.username}`);
    }
    log.info(`Migrated ${channels.length} channels`);
  }

  async backupChannels(filePath: string) {
    const channels = await this.chanFinder.findAll(true);
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
        platform: c.platform,
        priority: c.priority,
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
