import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.types.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelPriority } from '../persistence/channel.types.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { ChannelSearchRepository } from '../persistence/channel.search.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chanQuery: ChannelQueryRepository,
    private readonly chanSearch: ChannelSearchRepository,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    return this.solveTags(await this.chanQuery.findAll(), withTags);
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

  async findByQuery(
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanSearch.findByQuery({ page, size }, sorted, priority, tagName);
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
    const channels = await this.chanSearch.findByAnyTag(tagNames, { page, size }, sorted, priority);
    return this.solveTags(channels, withTags);
  }

  async findByAllTags(
    tagNames: string[],
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanSearch.findByAllTags(tagNames, sorted, priority);
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
}
