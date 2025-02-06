import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.types.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { ChannelSearchRepository } from '../persistence/channel.search.js';
import { ChannelPriority } from '../priority/types.js';
import { PlatformType } from '../../platform/types.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chanQuery: ChannelQueryRepository,
    private readonly chanSearch: ChannelSearchRepository,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    return this.solveChannels(await this.chanQuery.findAll(), withTags);
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const channel = await this.chanQuery.findById(channelId);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channelId),
    };
  }

  async findByPid(pid: string, withTags: boolean = false): Promise<ChannelRecord[]> {
    const channels = await this.chanQuery.findByPid(pid);
    return this.solveChannels(channels, withTags);
  }

  async findByPidOne(pid: string, platform: PlatformType, withTags: boolean = false) {
    const channels = await this.chanQuery.findByPidAndPlatform(pid, platform);
    if (channels.length === 0) return undefined;
    if (channels.length > 1) throw new Error(`Multiple channels with pid: ${pid}`);
    return this.solveChannel(channels[0], withTags);
  }

  async findByUsername(username: string, withTags: boolean = false): Promise<ChannelRecord[]> {
    const channels = await this.chanQuery.findByUsername(username);
    return this.solveChannels(channels, withTags);
  }

  async findFollowedChannels(platform: PlatformType): Promise<ChannelRecord[]> {
    return this.chanQuery.findByFollowedFlag(true, platform);
  }

  async findByQuery(
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanSearch.findByQuery({ page, size }, sorted, priority, tagName);
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
    const channels = await this.chanSearch.findByAnyTag(tagNames, { page, size }, sorted, priority);
    return this.solveChannels(channels, withTags);
  }

  async findByAllTags(
    tagNames: string[],
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanSearch.findByAllTags(tagNames, sorted, priority);
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
