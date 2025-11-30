import { Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { ConflictError } from '@/utils/errors/errors/ConflictError.js';
import { HttpRequestError } from '@/utils/errors/errors/HttpRequestError.js';
import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { hasDuplicates } from '@/utils/list.js';

import { channelAttr } from '@/common/attr/attr.live.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';
import { ChannelInfo } from '@/platform/spec/wapper/channel.js';
import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { ChannelFinder } from '@/channel/service/channel.finder.js';
import { ChannelMapper } from '@/channel/service/channel.mapper.js';
import { TagWriter } from '@/channel/service/tag.writer.js';
import {
  ChannelAppend,
  ChannelAppendWithFetch,
  ChannelAppendWithInfo,
  ChannelDto,
  ChannelUpdate,
  MappedChannelDto,
} from '@/channel/spec/channel.dto.schema.js';
import { ChannelEntAppend } from '@/channel/spec/channel.entity.schema.js';
import { TagDetachment, TagDto } from '@/channel/spec/tag.dto.schema.js';
import { ChannelsToTagsEntAppend } from '@/channel/spec/tag.entity.schema.js';
import { ChannelCacheStore } from '@/channel/storage/channel.cache.store.js';
import { ChannelCommandRepository, UpdateOptions } from '@/channel/storage/channel.command.js';
import { ChannelQueryRepository } from '@/channel/storage/channel.query.js';
import { TagCommandRepository } from '@/channel/storage/tag.command.js';
import { TagQueryRepository } from '@/channel/storage/tag.query.js';

import { LiveStreamRepository } from '@/live/storage/live-stream.repository.js';

@Injectable()
export class ChannelWriter {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly chQuery: ChannelQueryRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly tagWriter: TagWriter,
    private readonly tagQuery: TagQueryRepository,
    private readonly chFinder: ChannelFinder,
    private readonly chMapper: ChannelMapper,
    private readonly fetcher: PlatformFetcher,
    private readonly tagCmd: TagCommandRepository,
    private readonly cache: ChannelCacheStore,
    private readonly streamRepo: LiveStreamRepository,
  ) {}

  async createWithFetch(appendFetch: ChannelAppendWithFetch) {
    const platform = await this.pfFinder.findByIdNotNull(appendFetch.platformId);
    const info = await this.fetcher.fetchChannelNotNull(platform.name, appendFetch.sourceId, false);
    const appendInfo: ChannelAppendWithInfo = { ...appendFetch };
    return this.createWithInfo(appendInfo, info);
  }

  async createWithInfo(appendInfo: ChannelAppendWithInfo, info: ChannelInfo, tx: Tx = db) {
    const platform = await this.pfFinder.findByNameNotNull(info.platform, tx);
    const append: ChannelAppend = { ...appendInfo, ...info, platformId: platform.id };
    return this.createWithTagNames(append, appendInfo.tagNames, tx);
  }

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

  async createWithTagIds(append: ChannelAppend, tagIds?: string[], tx: Tx = db): Promise<MappedChannelDto> {
    if (tagIds && hasDuplicates(tagIds)) {
      throw new ConflictError('Duplicate tag names');
    }

    const platform = await this.pfFinder.findByIdNotNull(append.platformId, tx);
    if (await this.chFinder.findByPlatformAndSourceId(platform.name, append.sourceId, tx)) {
      throw new ConflictError(`Channel already exist ${append.username}`);
    }

    return tx.transaction(async (txx) => {
      const entAppend: ChannelEntAppend = {
        ...append,
        platformId: platform.id,
        gradeId: append.gradeId,
      };
      const channel = await this.chMapper.map(await this.chCmd.create(entAppend, txx));

      let mappedChannel: MappedChannelDto = { ...channel, tags: [] };
      const tags: TagDto[] = [];
      if (tagIds && tagIds.length > 0) {
        for (const tagId of tagIds) {
          const bind: ChannelsToTagsEntAppend = { channelId: channel.id, tagId };
          tags.push(await this.tagWriter.bind(bind, txx));
        }
        mappedChannel = { ...channel, tags };
      }

      await this.cache.set(channel);
      if (channel.isFollowed) {
        await this.cache.addFollowedChannel(channel.id);
      }

      return mappedChannel;
    });
  }

  async update(id: string, req: ChannelUpdate, opts: UpdateOptions, tx: Tx = db) {
    const ent = await this.chCmd.update(id, req, opts, tx);
    const dto = await this.chMapper.map(ent);

    if (!opts.refresh) {
      await this.cache.set(dto);
    }
    if (opts.refresh && (await this.cache.findById(dto.id))) {
      await this.cache.set(dto, { keepEx: true });
    }

    if (req.isFollowed == true) {
      await this.cache.addFollowedChannel(dto.id);
    }
    if (req.isFollowed == false) {
      await this.cache.removeFollowedChannel(dto.id);
    }

    return dto;
  }

  async delete(channelId: string, tx: Tx = db): Promise<ChannelDto> {
    return tx.transaction(async (txx) => {
      const ent = await this.chQuery.findById(channelId, txx);
      const channel = await this.chMapper.mapNullable(ent);
      if (!channel) throw NotFoundError.from('Channel', 'id', channelId);

      const tags = await this.tagQuery.findTagsByChannelId(channel.id, txx);
      for (const tag of tags) {
        const detach: TagDetachment = { channelId: channel.id, tagId: tag.id };
        await this.tagWriter.detach(detach, txx);
      }
      for (const stream of await this.streamRepo.findByChannel(channel.id, txx)) {
        if ((await this.streamRepo.findLiveCountByStreamId(stream.id, txx)) === 0) {
          await this.streamRepo.delete(stream.id, txx);
        }
      }
      await this.chCmd.delete(channel.id, txx);

      await this.cache.deleteByDto(channel);
      if (channel.isFollowed) {
        await this.cache.removeFollowedChannel(channel.id);
      }
      return channel;
    });
  }

  async refreshEarliestOne(): Promise<ChannelDto> {
    const channel = await this.chFinder.findEarliestRefreshedOne();
    if (!channel) {
      throw new NotFoundError('earliest refreshed channel not found');
    }

    try {
      const info = await this.fetcher.fetchChannel(channel.platform.name, channel.sourceId, false);
      if (!info) {
        log.debug(`During the refresh process, fetched channelInfo is null`, channelAttr(channel));
        return this.update(channel.id, {}, { refresh: true });
      }
      return await this.refreshOne(channel.id, info, {});
    } catch (e) {
      if (e instanceof HttpRequestError) {
        log.debug(`Failed to refresh channel`, channelAttr(channel));
        return await this.update(channel.id, {}, { refresh: true });
      } else {
        throw e;
      }
    }
  }

  async refreshOne(
    channelId: string,
    info: ChannelInfo,
    opts: { streamCheck?: boolean },
    tx: Tx = db,
  ): Promise<ChannelDto> {
    const updateReq: ChannelUpdate = {
      username: info.username,
      profileImgUrl: info.profileImgUrl,
      followerCnt: info.followerCnt,
    };
    return await this.update(channelId, updateReq, { ...opts, refresh: true }, tx);
  }
}
