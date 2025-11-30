import { Injectable } from '@nestjs/common';

import { ConflictError } from '@/utils/errors/errors/ConflictError.js';
import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';
import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { ChannelMapper } from '@/channel/service/channel.mapper.js';
import { ChannelDto } from '@/channel/spec/channel.dto.schema.js';
import { ChannelCacheStore } from '@/channel/storage/channel.cache.store.js';
import { ChannelQueryRepository } from '@/channel/storage/channel.query.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chQuery: ChannelQueryRepository,
    private readonly chMapper: ChannelMapper,
    private readonly pfFinder: PlatformFinder,
    private readonly cache: ChannelCacheStore,
  ) {}

  async findAll(): Promise<ChannelDto[]> {
    return this.chMapper.mapAll(await this.chQuery.findAll());
  }

  async findById(channelId: string, tx: Tx = db): Promise<ChannelDto | null> {
    const cache = await this.cache.findById(channelId);
    if (cache) return cache;

    const entity = await this.chQuery.findById(channelId, tx);
    const channel = await this.chMapper.mapNullable(entity, tx);
    if (!channel) return null;

    await this.cache.set(channel);
    return channel;
  }

  async findByPlatformAndSourceId(pfName: PlatformName, sourceId: string, tx: Tx = db): Promise<ChannelDto | null> {
    const cache = await this.cache.findByPlatformAndSourceId(pfName, sourceId);
    if (cache) return cache;

    const platform = await this.pfFinder.findByNameNotNull(pfName, tx);
    const entities = await this.chQuery.findByPlatformAndSourceId(platform.id, sourceId, tx);
    const channels = await this.chMapper.mapAll(entities, tx);
    if (channels.length === 0) return null;
    if (channels.length > 1) throw new ConflictError(`Multiple channels with sourceId: ${sourceId}`);
    const dto = channels[0];

    await this.cache.set(dto);
    return dto;
  }

  async findFollowedChannels(tx: Tx = db): Promise<ChannelDto[]> {
    const ids = await this.cache.getFollowedChannelIds();
    if (ids.length === 0) return [];

    const result: ChannelDto[] = [];
    for (const channel of await Promise.all(ids.map((id) => this.findById(id, tx)))) {
      if (!channel) {
        throw new NotFoundError(`Followed Channel not found in cache`);
      }
      result.push(channel);
    }
    return result;
  }

  async findEarliestRefreshedOne(): Promise<ChannelDto | null> {
    const entities = await this.chQuery.findEarliestRefreshed(1);
    if (entities.length === 0) {
      return null;
    }
    if (entities.length !== 1) {
      throw new ConflictError(`Invalid channel entities: length=${entities.length}`);
    }
    return await this.chMapper.map(entities[0]);
  }

  async findBySourceId(sourceId: string, tx: Tx = db): Promise<ChannelDto[]> {
    return this.chMapper.mapAll(await this.chQuery.findBySourceId(sourceId, tx), tx);
  }

  async findByUsernameLike(username: string, tx: Tx = db): Promise<ChannelDto[]> {
    return this.chMapper.mapAll(await this.chQuery.findByUsernameLike(username, tx), tx);
  }
}
