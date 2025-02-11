import { Injectable } from '@nestjs/common';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../../tag/persistence/tag.query.js';
import { ChannelMapper } from './channel.mapper.js';
import { ConflictError } from '../../../utils/errors/errors/ConflictError.js';
import { PlatformType } from '../../../platform/storage/platform.business.schema.js';
import { PlatformFinder } from '../../../platform/storage/platform.finder.js';

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
    const records = await this.chMapper.mapAll(entities);
    return this.chMapper.loadRelations(records, withTags);
  }

  async findById(channelId: string, withTags: boolean = false) {
    const ent = await this.chQuery.findById(channelId);
    const channel = await this.chMapper.mapNullable(ent);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channelId),
    };
  }

  async findByPid(pid: string, withTags: boolean = false) {
    const entities = await this.chQuery.findByPid(pid);
    const channels = await this.chMapper.mapAll(entities);
    return this.chMapper.loadRelations(channels, withTags);
  }

  async findByPidAndPlatform(pid: string, platformName: PlatformType, withTags: boolean = false) {
    const platform = await this.pfFinder.findByNameNotNull(platformName);
    const entities = await this.chQuery.findByPidAndPlatform(pid, platform.id);
    const channels = await this.chMapper.mapAll(entities);
    if (channels.length === 0) return undefined;
    if (channels.length > 1) throw new ConflictError(`Multiple channels with pid: ${pid}`);
    return this.chMapper.loadRelation(channels[0], withTags);
  }

  async findByUsernameLike(username: string, withTags: boolean = false) {
    const entities = await this.chQuery.findByUsernameLike(username);
    const channels = await this.chMapper.mapAll(entities);
    return this.chMapper.loadRelations(channels, withTags);
  }

  async findFollowedChannels(platform: PlatformType) {
    const entities = await this.chQuery.findByFollowedFlag(true, platform);
    return this.chMapper.mapAll(entities);
  }
}
