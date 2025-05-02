import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../spec/channel.dto.schema.js';
import { ChannelEnt } from '../spec/channel.entity.schema.js';
import { TagQueryRepository } from '../storage/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { PriorityService } from './priority.service.js';
import { ChannelMapOptions } from '../spec/channel.types.js';

@Injectable()
export class ChannelMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly priService: PriorityService,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async mapAll(entities: ChannelEnt[], tx: Tx = db) {
    return Promise.all(entities.map((ent) => this.map(ent, tx)));
  }

  async mapNullable(ent: ChannelEnt | undefined, tx: Tx = db) {
    if (!ent) return undefined;
    return this.map(ent, tx);
  }

  async map(ent: ChannelEnt, tx: Tx = db): Promise<ChannelDto> {
    const platformP = this.pfFinder.findByIdNotNull(ent.platformId, tx);
    const priorityP = this.priService.findByIdNotNull(ent.priorityId, tx);
    return { ...ent, platform: await platformP, priority: await priorityP };
  }

  async loadRelations(channels: ChannelDto[], opts: ChannelMapOptions, tx: Tx = db): Promise<ChannelDto[]> {
    const withTags = opts.tags ?? false;
    const withTopics = opts.topics ?? false;
    if (!withTags && !withTopics) return channels;
    const promises = channels.map(async (channel) => {
      return this.loadRelation(channel, opts, tx);
    });
    return Promise.all(promises);
  }

  async loadRelation(channel: ChannelDto, opts: ChannelMapOptions, tx: Tx = db): Promise<ChannelDto> {
    const withTags = opts.tags ?? false;
    const withTopics = opts.topics ?? false;
    if (!withTags && !withTopics) return channel;
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id, tx),
    };
  }
}
