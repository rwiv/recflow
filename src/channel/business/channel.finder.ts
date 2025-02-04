import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.types.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelPriority } from '../persistence/channel.types.js';
import { ChannelQueryRepository } from '../persistence/channel.query.repository.js';
import { TagQueryRepository } from '../persistence/tag.query.repository.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chanQuery: ChannelQueryRepository,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    return this.solveTags(await this.chanQuery.findAll(), withTags);
  }

  async findByQuery(
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanQuery.findByQuery({ page, size }, sorted, priority, tagName);
    return this.solveTags(channels, withTags);
  }

  async findByAnyTag(
    tagNames: string[],
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanQuery.findByAnyTag(tagNames, { page, size }, sorted, priority);
    return this.solveTags(channels, withTags);
  }

  async findByAllTags(
    tagNames: string[],
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanQuery.findByAllTags(tagNames, sorted, priority);
    return this.solveTags(channels, withTags);
  }

  private async solveTags(channels: ChannelRecord[], withTags: boolean = false) {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id),
    }));
    return Promise.all(promises);
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
}
