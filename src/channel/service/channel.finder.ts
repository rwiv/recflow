import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { TagQueryRepository } from '../storage/tag.query.js';
import { ChannelMapper } from './channel.mapper.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ChannelDto } from '../spec/channel.dto.schema.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chQuery: ChannelQueryRepository,
    private readonly chMapper: ChannelMapper,
    private readonly tagQuery: TagQueryRepository,
    private readonly pfFinder: PlatformFinder,
  ) {}

  async findAll(withTags: boolean = false) {
    const entities = await this.chQuery.findAll();
    const channels = await this.chMapper.mapAll(entities);
    return this.chMapper.loadRelations(channels, withTags);
  }

  async findById(channelId: string, withTags: boolean = false, tx: Tx = db) {
    const ent = await this.chQuery.findById(channelId, tx);
    const channel = await this.chMapper.mapNullable(ent, tx);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channelId, tx),
    };
  }

  async findEarliestRefreshedOne(withTags: boolean = false): Promise<ChannelDto | undefined> {
    const entities = await this.chQuery.findEarliestRefreshed(1);
    if (entities.length === 0) {
      return undefined;
    }
    if (entities.length !== 1) {
      throw new ConflictError(`Invalid channel entities: length=${entities.length}`);
    }
    return this.chMapper.loadRelation(await this.chMapper.map(entities[0]), withTags);
  }

  async findByPid(pid: string, withTags: boolean = false) {
    const entities = await this.chQuery.findByPid(pid);
    const channels = await this.chMapper.mapAll(entities);
    return this.chMapper.loadRelations(channels, withTags);
  }

  async findByPidAndPlatform(
    pid: string,
    platformName: PlatformName,
    withTags: boolean = false,
    tx: Tx = db,
  ) {
    const platform = await this.pfFinder.findByNameNotNull(platformName, tx);
    const entities = await this.chQuery.findByPidAndPlatform(pid, platform.id, tx);
    const channels = await this.chMapper.mapAll(entities, tx);
    if (channels.length === 0) return undefined;
    if (channels.length > 1) throw new ConflictError(`Multiple channels with pid: ${pid}`);
    return this.chMapper.loadRelation(channels[0], withTags, tx);
  }

  async findByUsernameLike(username: string, withTags: boolean = false, tx: Tx = db) {
    const entities = await this.chQuery.findByUsernameLike(username, tx);
    const channels = await this.chMapper.mapAll(entities, tx);
    return this.chMapper.loadRelations(channels, withTags, tx);
  }

  async findFollowedChannels(tx: Tx = db) {
    const entities = await this.chQuery.findByFollowedFlag(true, tx);
    return this.chMapper.mapAll(entities, tx);
  }
}
