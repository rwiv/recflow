import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { db } from '../../../infra/db/db.js';
import {
  ChannelAppendWithFetch,
  ChannelAppendWithInfo,
  ChannelRecord,
  ChannelAppend,
} from './channel.business.schema.js';
import { TagDetachment, TagRecord } from '../../tag/business/tag.business.schema.js';
import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { TagWriter } from '../../tag/business/tag.writer.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../../tag/persistence/tag.query.js';
import { Tx } from '../../../infra/db/types.js';
import { ChannelInfo } from '../../../platform/spec/wapper/channel.js';
import { ChannelMapper } from './channel.mapper.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { ChannelPriorityRepository } from '../persistence/priority.repository.js';
import { ChannelEntAppend } from '../persistence/channel.persistence.schema.js';
import { hasDuplicates } from '../../../utils/list.js';
import { ConflictError } from '../../../utils/errors/errors/ConflictError.js';
import { ChannelsToTagsEntAppend } from '../../tag/persistence/tag.persistence.schema.js';
import { TagCommandRepository } from '../../tag/persistence/tag.command.js';
import { PlatformFinder } from '../../../platform/storage/platform.finder.js';

@Injectable()
export class ChannelWriter {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly tagWriter: TagWriter,
    private readonly tagQuery: TagQueryRepository,
    private readonly chMapper: ChannelMapper,
    private readonly fetcher: PlatformFetcher,
    private readonly tagCmd: TagCommandRepository,
  ) {}

  async createWithTagNames(append: ChannelAppend, tagNames?: string[]) {
    return db.transaction(async (tx) => {
      const tagIds: string[] = [];
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tag = await this.tagQuery.findByName(tagName, tx);
          if (tag) {
            tagIds.push(tag.id);
          } else {
            tagIds.push((await this.tagCmd.create({ name: tagName }, tx)).id);
          }
        }
      }
      return this.createWithTagIds(append, tagIds, tx);
    });
  }

  async createWithTagIds(append: ChannelAppend, tagIds?: string[], tx: Tx = db) {
    if (tagIds && hasDuplicates(tagIds)) {
      throw new ConflictError('Duplicate tag names');
    }
    const platform = await this.pfFinder.findByNameNotNull(append.platformName);
    const entities = await this.chQuery.findByPidAndPlatform(append.pid, platform.id);
    if (entities.length > 0) {
      throw new ConflictError(`Channel already exist ${append.username}`);
    }

    const priority = await this.priRepo.findByName(append.priorityName);
    if (!priority) throw NotFoundError.from('Priority', 'name', append.priorityName);

    const entAppend: ChannelEntAppend = {
      ...append,
      platformId: platform.id,
      priorityId: priority.id,
    };
    return tx.transaction(async (txx) => {
      const ent = await this.chCmd.create(entAppend, txx);
      const channel = await this.chMapper.map(ent);
      let result: ChannelRecord = { ...channel };
      const tags: TagRecord[] = [];
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
    const info = await this.fetcher.fetchChannelNotNull(appendFetch.platformName, appendFetch.pid, false);
    const appendInfo: ChannelAppendWithInfo = { ...appendFetch };
    return this.createWithInfo(appendInfo, info);
  }

  async createWithInfo(appendInfo: ChannelAppendWithInfo, info: ChannelInfo) {
    const append: ChannelAppend = { ...appendInfo, ...info, platformName: info.platform };
    return this.createWithTagNames(append, appendInfo.tagNames);
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelRecord> {
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
}
