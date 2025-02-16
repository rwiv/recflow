import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../spec/channel.dto.schema.js';
import { PriorityRepository } from '../storage/priority.repository.js';
import { ChannelEnt } from '../spec/channel.entity.schema.js';
import { TagQueryRepository } from '../storage/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';

@Injectable()
export class ChannelMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly priRepo: PriorityRepository,
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
    const platform = await this.pfFinder.findByIdNotNull(ent.platformId, tx);
    const priority = await this.priRepo.findById(ent.priorityId, tx);
    if (!priority) throw NotFoundError.from('Priority', 'id', ent.priorityId);
    return { ...ent, platform, priority };
  }

  async loadRelations(channels: ChannelDto[], withTags: boolean = false, tx: Tx = db): Promise<ChannelDto[]> {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id, tx),
    }));
    return Promise.all(promises);
  }

  async loadRelation(channels: ChannelDto, withTags: boolean = false, tx: Tx = db): Promise<ChannelDto> {
    if (!withTags) return channels;
    return {
      ...channels,
      tags: await this.tagQuery.findTagsByChannelId(channels.id, tx),
    };
  }
}
