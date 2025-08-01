import { Injectable } from '@nestjs/common';
import { ChannelDto, MappedChannelDto } from '../spec/channel.dto.schema.js';
import { ChannelEnt } from '../spec/channel.entity.schema.js';
import { TagQueryRepository } from '../storage/tag.query.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { GradeService } from './grade.service.js';
import { ChannelMapOptions } from '../spec/channel.types.js';

@Injectable()
export class ChannelMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly grService: GradeService,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async mapAll(entities: ChannelEnt[], tx: Tx = db) {
    return Promise.all(entities.map((ent) => this.map(ent, tx)));
  }

  async mapNullable(ent: ChannelEnt | null, tx: Tx = db) {
    if (!ent) return null;
    return this.map(ent, tx);
  }

  async map(ent: ChannelEnt, tx: Tx = db): Promise<ChannelDto> {
    const platformP = this.pfFinder.findByIdNotNull(ent.platformId, tx);
    const gradeP = this.grService.findByIdNotNull(ent.gradeId, tx);
    return { ...ent, platform: await platformP, grade: await gradeP };
  }

  async loadRelations(channels: ChannelDto[], opts: ChannelMapOptions, tx: Tx = db): Promise<MappedChannelDto[]> {
    const withTags = opts.tags ?? false;
    const withTopics = opts.topics ?? false;
    if (!withTags && !withTopics) {
      return channels;
    }
    return Promise.all(channels.map((channel) => this.loadRelation(channel, opts, tx)));
  }

  async loadRelation(channel: ChannelDto, opts: ChannelMapOptions, tx: Tx = db): Promise<MappedChannelDto> {
    const withTags = opts.tags ?? false;
    const withTopics = opts.topics ?? false;
    if (!withTags && !withTopics) {
      return channel;
    }
    return {
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id, tx),
    };
  }
}
