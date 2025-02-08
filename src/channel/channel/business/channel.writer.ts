import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { db } from '../../../infra/db/db.js';
import {
  ChannelAppendWithFetch,
  ChannelAppendWithInfo,
  ChannelRecord,
  ChannelAppend,
} from './channel.business.schema.js';
import { TagAttachment, TagDetachment, TagRecord } from '../../tag/business/tag.business.schema.js';
import { Injectable } from '@nestjs/common';
import { PlatformFetcher } from '../../../platform/fetcher/fetcher.js';
import { notNull } from '../../../utils/null.js';
import { TagWriter } from '../../tag/business/tag.writer.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../../tag/persistence/tag.query.js';
import { Tx } from '../../../infra/db/types.js';
import { ChannelInfo } from '../../../platform/wapper/channel.js';
import { ChannelMapper } from './channel.mapper.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { PlatformRepository } from '../../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../../priority/priority.repository.js';
import { ChannelEntAppend } from '../persistence/channel.persistence.schema.js';
import { hasDuplicates } from '../../../utils/list.js';
import { ConflictError } from '../../../utils/errors/errors/ConflictError.js';

@Injectable()
export class ChannelWriter {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly tagWriter: TagWriter,
    private readonly tagQuery: TagQueryRepository,
    private readonly chMapper: ChannelMapper,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async create(append: ChannelAppend, tagNames: string[] | undefined): Promise<ChannelRecord> {
    if (tagNames && hasDuplicates(tagNames)) {
      throw new ConflictError('Duplicate tag names');
    }
    const entities = await this.chQuery.findByPidAndPlatform(append.pid, append.platformName);
    if (entities.length > 0) {
      throw new ConflictError('Channel already exists');
    }

    const platform = await this.pfRepo.findByName(append.platformName);
    if (!platform) throw new NotFoundError('Platform not found');
    const priority = await this.priRepo.findByName(append.priorityName);
    if (!priority) throw new NotFoundError('ChannelPriority not found');

    const entAppend: ChannelEntAppend = {
      ...append,
      platformId: platform.id,
      priorityId: priority.id,
    };
    return db.transaction(async (txx) => {
      const ent = await this.chCmd.create(entAppend, txx);
      const channel = await this.chMapper.map(ent);
      let result: ChannelRecord = { ...channel };
      const tags: TagRecord[] = [];
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const attach: TagAttachment = { channelId: channel.id, tagName };
          tags.push(await this.tagWriter.attach(attach, txx));
        }
        result = { ...channel, tags };
      }
      return result;
    });
  }

  async createWithFetch(appendFetch: ChannelAppendWithFetch) {
    const info = notNull(
      await this.fetcher.fetchChannel(appendFetch.platformName, appendFetch.pid, false),
    );
    const appendInfo: ChannelAppendWithInfo = { ...appendFetch };
    return this.createWithInfo(appendInfo, info);
  }

  async createWithInfo(appendInfo: ChannelAppendWithInfo, info: ChannelInfo) {
    const append: ChannelAppend = { ...appendInfo, ...info, platformName: info.platform };
    return this.create(append, appendInfo.tagNames);
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelRecord> {
    const ent = await this.chQuery.findById(channelId, tx);
    const channel = await this.chMapper.mapNullable(ent);
    if (!channel) throw new NotFoundError('Channel not found');
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
