import { ChannelCreation, ChannelPriority, ChannelUpdate } from '../persistence/channel.types.js';
import { ChannelRepository } from '../persistence/channel.repository.js';
import { TagRepository } from '../persistence/tag.repository.js';
import { db } from '../../infra/db/db.js';
import { ChannelSortType } from '../persistence/tag.types.js';
import { ChannelRecord } from './channel.types.js';
import { TagRecord } from './tag.types.js';
import { ChannelQueryRepository } from '../persistence/channel.repository.query.js';
import { Injectable } from '@nestjs/common';
import { ChannelValidator } from './channel.validator.js';

@Injectable()
export class ChannelService {
  constructor(
    private readonly chanRepo: ChannelRepository,
    private readonly chanQueryRepo: ChannelQueryRepository,
    private readonly tagRepo: TagRepository,
    private readonly validator: ChannelValidator,
  ) {}

  async create(req: ChannelCreation, reqTagNames: string[]): Promise<ChannelRecord> {
    req = this.validator.validateCreate(req, reqTagNames);
    return db.transaction(async (txx) => {
      const channel = await this.chanRepo.create(req, txx);
      const tags: TagRecord[] = [];
      for (const tagName of reqTagNames) {
        tags.push(await this.tagRepo.attach({ channelId: channel.id, tagName }, txx));
      }
      return {
        ...channel,
        tags,
      };
    });
  }

  async update(req: ChannelUpdate, reqTagNames: string[]): Promise<ChannelRecord> {
    req = this.validator.validateUpdate(req, reqTagNames);
    return db.transaction(async (txx) => {
      const channel = await this.chanRepo.update(req, txx);
      const tags = await this.tagRepo.applyTags(channel.id, reqTagNames, txx);
      return {
        ...channel,
        tags,
      };
    });
  }

  async delete(channelId: string): Promise<ChannelRecord> {
    return this.chanRepo.delete(channelId);
  }

  async findAll(withTags: boolean = false): Promise<ChannelRecord[]> {
    return this.solve(await this.chanRepo.findAll(), withTags);
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
    return this.solve(channels, withTags);
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
    return this.solve(channels, withTags);
  }

  async findByAllTags(
    tagNames: string[],
    sorted: ChannelSortType = undefined,
    priority: ChannelPriority | undefined = undefined,
    withTags: boolean = false,
  ): Promise<ChannelRecord[]> {
    const channels = await this.chanQueryRepo.findByAllTags(tagNames, sorted, priority);
    return this.solve(channels, withTags);
  }

  private async solve(channels: ChannelRecord[], withTags: boolean = false) {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagRepo.findTagsByChannelId(channel.id),
    }));
    return Promise.all(promises);
  }

  async findById(channelId: string, withTags: boolean = false): Promise<ChannelRecord | undefined> {
    const channel = await this.chanRepo.findById(channelId);
    if (!channel) return undefined;
    if (!withTags) return channel;
    return {
      ...channel,
      tags: await this.tagRepo.findTagsByChannelId(channelId),
    };
  }
}
