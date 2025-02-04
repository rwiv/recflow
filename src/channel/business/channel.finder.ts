import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.types.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelPriority } from '../persistence/channel.types.js';
import { ChannelQueryRepository } from '../persistence/channel.query.repository.js';
import { TagQueryRepository } from '../persistence/tag.query.repository.js';

@Injectable()
export class ChannelFinder {
  constructor(
    private readonly chanQueryRepo: ChannelQueryRepository,
    private readonly tagQueryRepo: TagQueryRepository,
  ) {}

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    return this.solveTags(await this.chanQueryRepo.findAll(), withTags);
  }

  async findByQuery(
    page: number,
    size: number,
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    tagName: string | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanQueryRepo.findByQuery(
      { page, size },
      sorted,
      priority,
      tagName,
    );
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
    const channels = await this.chanQueryRepo.findByAnyTag(
      tagNames,
      { page, size },
      sorted,
      priority,
    );
    return this.solveTags(channels, withTags);
  }

  async findByAllTags(
    tagNames: string[],
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanQueryRepo.findByAllTags(tagNames, sorted, priority);
    return this.solveTags(channels, withTags);
  }

  private async solveTags(channels: ChannelRecord[], withTags: boolean = false) {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagQueryRepo.findTagsByChannelId(channel.id),
    }));
    return Promise.all(promises);
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const channel = await this.chanQueryRepo.findById(channelId);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagQueryRepo.findTagsByChannelId(channelId),
    };
  }
}
