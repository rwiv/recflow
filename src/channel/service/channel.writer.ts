import { ChannelCommandRepository } from '../storage/channel.command.js';
import { db } from '../../infra/db/db.js';
import {
  ChannelAppendWithFetch,
  ChannelAppendWithInfo,
  ChannelDto,
  ChannelAppend,
  ChannelUpdate,
} from '../spec/channel.dto.schema.js';
import { TagDetachment, TagDto } from '../spec/tag.dto.schema.js';
import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { TagWriter } from './tag.writer.js';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { TagQueryRepository } from '../storage/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { ChannelInfo } from '../../platform/spec/wapper/channel.js';
import { ChannelMapper } from './channel.mapper.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { ChannelEntAppend } from '../spec/channel.entity.schema.js';
import { hasDuplicates } from '../../utils/list.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { ChannelsToTagsEntAppend } from '../spec/tag.entity.schema.js';
import { TagCommandRepository } from '../storage/tag.command.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { PriorityService } from './priority.service.js';
import { ChannelFinder } from './channel.finder.js';

@Injectable()
export class ChannelWriter {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly priService: PriorityService,
    private readonly tagWriter: TagWriter,
    private readonly tagQuery: TagQueryRepository,
    private readonly chFinder: ChannelFinder,
    private readonly chMapper: ChannelMapper,
    private readonly fetcher: PlatformFetcher,
    private readonly tagCmd: TagCommandRepository,
  ) {}

  async createWithTagNames(append: ChannelAppend, tagNames?: string[], tx: Tx = db) {
    return tx.transaction(async (txx) => {
      const tagIds: string[] = [];
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tag = await this.tagQuery.findByName(tagName, txx);
          if (tag) {
            tagIds.push(tag.id);
          } else {
            tagIds.push((await this.tagCmd.create({ name: tagName }, txx)).id);
          }
        }
      }
      return this.createWithTagIds(append, tagIds, txx);
    });
  }

  async createWithTagIds(append: ChannelAppend, tagIds?: string[], tx: Tx = db) {
    if (tagIds && hasDuplicates(tagIds)) {
      throw new ConflictError('Duplicate tag names');
    }
    const platform = await this.pfFinder.findByIdNotNull(append.platformId);
    const entities = await this.chQuery.findByPidAndPlatform(append.pid, platform.id);
    if (entities.length > 0) {
      throw new ConflictError(`Channel already exist ${append.username}`);
    }
    const priority = await this.priService.findByIdNotNull(append.priorityId);

    const entAppend: ChannelEntAppend = {
      ...append,
      platformId: platform.id,
      priorityId: priority.id,
    };
    return tx.transaction(async (txx) => {
      const ent = await this.chCmd.create(entAppend, txx);
      const channel = await this.chMapper.map(ent);
      let result: ChannelDto = { ...channel };
      const tags: TagDto[] = [];
      if (tagIds && tagIds.length > 0) {
        for (const tagId of tagIds) {
          const bind: ChannelsToTagsEntAppend = { channelId: channel.id, tagId };
          tags.push(await this.tagWriter.bind(bind, txx));
        }
        result = { ...channel, tags };
      }
      return result;
    });
  }

  async createWithFetch(appendFetch: ChannelAppendWithFetch) {
    const platform = await this.pfFinder.findByIdNotNull(appendFetch.platformId);
    const info = await this.fetcher.fetchChannelNotNull(platform.name, appendFetch.pid, false);
    const appendInfo: ChannelAppendWithInfo = { ...appendFetch };
    return this.createWithInfo(appendInfo, info);
  }

  async createWithInfo(appendInfo: ChannelAppendWithInfo, info: ChannelInfo, tx: Tx = db) {
    const platform = await this.pfFinder.findByNameNotNull(info.platform, tx);
    const append: ChannelAppend = { ...appendInfo, ...info, platformId: platform.id };
    return this.createWithTagNames(append, appendInfo.tagNames, tx);
  }

  async update(id: string, req: ChannelUpdate, isRefresh: boolean, tx: Tx = db) {
    const ent = await this.chCmd.update(id, req, isRefresh, tx);
    return this.chMapper.map(ent);
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelDto> {
    const ent = await this.chQuery.findById(channelId, tx);
    const channel = await this.chMapper.mapNullable(ent);
    if (!channel) throw NotFoundError.from('Channel', 'id', channelId);
    const tags = await this.tagQuery.findTagsByChannelId(channel.id, tx);
    return tx.transaction(async (txx) => {
      for (const tag of tags) {
        const detach: TagDetachment = { channelId: channel.id, tagId: tag.id };
        await this.tagWriter.detach(detach, txx);
      }
      await this.chCmd.delete(channel.id, txx);
      return channel;
    });
  }

  async refresh(): Promise<ChannelDto> {
    const channel = await this.chFinder.findEarliestRefreshedOne();
    const info = await this.fetcher.fetchChannelNotNull(channel.platform.name, channel.pid, false);
    const update: ChannelUpdate = {
      username: info.username,
      profileImgUrl: info.profileImgUrl,
      followerCnt: info.followerCnt,
    };
    return this.update(channel.id, update, true);
  }
}
