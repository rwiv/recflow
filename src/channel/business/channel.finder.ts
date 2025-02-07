import { Injectable } from '@nestjs/common';
import { ChannelRecord, ChannelSortType } from './channel.types.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { ChannelSearchRepository } from '../persistence/channel.search.js';
import { ChannelPriority } from '../priority/types.js';
import { PlatformType } from '../../platform/types.js';
import { ChannelMapper } from './channel.mapper.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chQuery: ChannelQueryRepository,
    private readonly chSearch: ChannelSearchRepository,
    private readonly chMapper: ChannelMapper,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    const entities = await this.chQuery.findAll();
    const records = await this.chMapper.mapAll(entities);
    return this.solveChannels(records, withTags);
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const ent = await this.chQuery.findById(channelId);
    const channel = await this.chMapper.mapNullable(ent);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channelId),
    };
  }

  async findByPid(pid: string, withTags: boolean = false): Promise<ChannelRecord[]> {
    const entities = await this.chQuery.findByPid(pid);
    const channels = await this.chMapper.mapAll(entities);
    return this.solveChannels(channels, withTags);
  }

  async findByPidOne(pid: string, platform: PlatformType, withTags: boolean = false) {
    const entities = await this.chQuery.findByPidAndPlatform(pid, platform);
    const channels = await this.chMapper.mapAll(entities);
    if (channels.length === 0) return undefined;
    if (channels.length > 1) throw new Error(`Multiple channels with pid: ${pid}`);
    return this.solveChannel(channels[0], withTags);
  }

  async findByUsername(username: string, withTags: boolean = false): Promise<ChannelRecord[]> {
    const entities = await this.chQuery.findByUsername(username);
    const channels = await this.chMapper.mapAll(entities);
    return this.solveChannels(channels, withTags);
  }

  async findFollowedChannels(platform: PlatformType): Promise<ChannelRecord[]> {
    const entities = await this.chQuery.findByFollowedFlag(true, platform);
    return this.chMapper.mapAll(entities);
  }

  async findByQuery(
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const entities = await this.chSearch.findByQuery({ page, size }, sorted, priority, tagName);
    const channels = await this.chMapper.mapAll(entities);
    return this.solveChannels(channels, withTags);
  }

  async findByAnyTag(
    tagNames: string[],
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const entities = await this.chSearch.findByAnyTag(tagNames, { page, size }, sorted, priority);
    const channels = await this.chMapper.mapAll(entities);
    return this.solveChannels(channels, withTags);
  }

  private async solveChannels(channels: ChannelRecord[], withTags: boolean = false) {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id),
    }));
    return Promise.all(promises);
  }

  private async solveChannel(channels: ChannelRecord, withTags: boolean = false) {
    if (!withTags) return channels;
    return {
      ...channels,
      tags: await this.tagQuery.findTagsByChannelId(channels.id),
    };
  }
}
