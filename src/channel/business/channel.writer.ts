import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { db } from '../../infra/db/db.js';
import {
  ChannelAppendWithFetch,
  ChannelAppendWithInfo,
  ChannelRecord,
  channelAppend,
  ChannelAppend,
} from './channel.schema.js';
import { tagAttachment, tagDetachment, TagRecord } from './tag.schema.js';
import { Injectable } from '@nestjs/common';
import { ChannelValidator } from './channel.validator.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { assertNotNull } from '../../utils/null.js';
import { TagWriter } from './tag.writer.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { ChannelInfo } from '../../platform/wapper/channel.js';
import { ChannelMapper } from './channel.mapper.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { PlatformRepository } from '../persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';
import { channelEntAppend } from '../persistence/channel.schema.js';

@Injectable()
export class ChannelWriter {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly tagWriter: TagWriter,
    private readonly tagQuery: TagQueryRepository,
    private readonly validator: ChannelValidator,
    private readonly chMapper: ChannelMapper,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async create(req: ChannelAppend, tagNames: string[] | undefined): Promise<ChannelRecord> {
    await this.validator.validateForm(req.pid, req.platformName, tagNames);
    const platform = await this.pfRepo.findByName(req.platformName);
    if (!platform) throw new NotFoundError('Platform not found');
    const priority = await this.priRepo.findByName(req.priorityName);
    if (!priority) throw new NotFoundError('ChannelPriority not found');
    const reqEnt = channelEntAppend.parse({
      ...req,
      platformId: platform.id,
      priorityId: priority.id,
    });
    return db.transaction(async (txx) => {
      const ent = await this.chCmd.create(reqEnt, txx);
      const channel = await this.chMapper.map(ent);
      let result: ChannelRecord = { ...channel };
      const tags: TagRecord[] = [];
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const req = tagAttachment.parse({ channelId: channel.id, tagName });
          tags.push(await this.tagWriter.attach(req, txx));
        }
        result = { ...channel, tags };
      }
      return result;
    });
  }

  async createWithFetch(req: ChannelAppendWithFetch): Promise<ChannelRecord> {
    const info = assertNotNull(await this.fetcher.fetchChannel(req.platformName, req.pid, false));
    return this.createWithChannelInfo(req, info);
  }

  async createWithChannelInfo(
    req: ChannelAppendWithInfo,
    info: ChannelInfo,
  ): Promise<ChannelRecord> {
    const reqEnt = channelAppend.parse({
      pid: info.pid,
      username: info.username,
      profileImgUrl: info.profileImgUrl,
      followerCnt: info.followerCnt,
      platformName: info.platform,
      priorityName: req.priorityName,
      followed: req.followed,
      description: req.description,
    });
    return this.create(reqEnt, req.tagNames);
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelRecord> {
    const ent = await this.chQuery.findById(channelId, tx);
    const channel = await this.chMapper.mapNullable(ent);
    if (!channel) throw new NotFoundError('Channel not found');
    const tags = await this.tagQuery.findTagsByChannelId(channel.id, tx);
    return tx.transaction(async (txx) => {
      for (const tag of tags) {
        const req = tagDetachment.parse({ channelId: channel.id, tagId: tag.id });
        await this.tagWriter.detach(req, txx);
      }
      await this.chCmd.delete(channel.id, txx);
      return channel;
    });
  }
}
