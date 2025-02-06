import { ChannelEntCreation } from '../persistence/channel.types.js';
import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { db } from '../../infra/db/db.js';
import { ChannelCreation, ChannelCreationBase, ChannelRecord } from './channel.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';
import { ChannelValidator } from './channel.validator.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { assertNotNull } from '../../utils/null.js';
import { TagWriter } from './tag.writer.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';

@Injectable()
export class ChannelWriter {
  constructor(
    private readonly chanCmd: ChannelCommandRepository,
    private readonly chanQuery: ChannelQueryRepository,
    private readonly tagWriter: TagWriter,
    private readonly tagQuery: TagQueryRepository,
    private readonly validator: ChannelValidator,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async create(req: ChannelEntCreation, tagNames: string[] | undefined): Promise<ChannelRecord> {
    await this.validator.validateForm(req, tagNames);
    return db.transaction(async (txx) => {
      const channel = await this.chanCmd.create(req, txx);
      let result: ChannelRecord = { ...channel };
      const tags: TagRecord[] = [];
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          tags.push(await this.tagWriter.attach({ channelId: channel.id, tagName }, txx));
        }
        result = { ...channel, tags };
      }
      return result;
    });
  }

  async createWithFetch(req: ChannelCreation): Promise<ChannelRecord> {
    const info = assertNotNull(await this.fetcher.fetchChannel(req.platform, req.pid, false));
    return this.createWithChannelInfo(req, info);
  }

  async createWithChannelInfo(req: ChannelCreationBase, info: ChannelInfo): Promise<ChannelRecord> {
    const reqEnt: ChannelEntCreation = {
      pid: info.pid,
      username: info.username,
      profileImgUrl: info.profileImgUrl,
      followerCnt: info.followerCnt,
      platform: info.platform,
      priority: req.priority,
      followed: req.followed,
      description: req.description,
    };
    return this.create(reqEnt, req.tagNames);
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelRecord> {
    const channel = await this.chanQuery.findById(channelId, tx);
    if (!channel) throw new Error('Channel not found');
    const tags = await this.tagQuery.findTagsByChannelId(channel.id, tx);
    return tx.transaction(async (txx) => {
      for (const tag of tags) {
        await this.tagWriter.detach({ channelId: channel.id, tagId: tag.id }, txx);
      }
      await this.chanCmd.delete(channel.id, txx);
      return channel;
    });
  }
}
