import { ChannelEntCreation } from '../persistence/channel.types.js';
import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { db } from '../../infra/db/db.js';
import { ChannelCreation, ChannelRecord, ChannelRecordUpdate } from './channel.types.js';
import { TagRecord } from './tag.types.js';
import { Injectable } from '@nestjs/common';
import { ChannelValidator } from './channel.validator.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { assertNotNull } from '../../utils/null.js';
import { TagWriter } from './tag.writer.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { Tx } from '../../infra/db/types.js';

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

  async create(req: ChannelEntCreation, reqTagNames: string[]): Promise<ChannelRecord> {
    return db.transaction(async (txx) => {
      const channel = await this.chanCmd.create(req, txx);
      const tags: TagRecord[] = [];
      for (const tagName of reqTagNames) {
        tags.push(await this.tagWriter.attach({ channelId: channel.id, tagName }, txx));
      }
      return { ...channel, tags };
    });
  }

  async createWithFetch(req: ChannelCreation): Promise<ChannelRecord> {
    req = this.validator.validateCreate(req);
    const info = assertNotNull(await this.fetcher.fetchChannel(req.platform, req.pid, false));
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
    return db.transaction(async (txx) => {
      const channel = await this.chanCmd.create(reqEnt, txx);
      let result: ChannelRecord = { ...channel };
      const tags: TagRecord[] = [];
      if (req.tagNames && req.tagNames.length > 0) {
        for (const tagName of req.tagNames) {
          tags.push(await this.tagWriter.attach({ channelId: channel.id, tagName }, txx));
        }
        result = { ...channel, tags };
      }
      return result;
    });
  }

  async update(req: ChannelRecordUpdate): Promise<ChannelRecord> {
    req = this.validator.validateUpdate(req);
    return db.transaction(async (txx) => {
      const channel = await this.chanCmd.update(req, txx);
      let result: ChannelRecord = { ...channel };
      let tags: TagRecord[] = [];
      if (req.tagNames && req.tagNames.length > 0) {
        tags = await this.tagWriter.applyTags(channel.id, req.tagNames, txx);
        result = { ...result, tags };
      }
      return result;
    });
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
