import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.business.schema.js';
import { notNull } from '../../../utils/null.js';
import { PlatformRepository } from '../../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../../priority/persistence/priority.repository.js';
import { ChannelEnt } from '../persistence/channel.persistence.schema.js';
import { platformTypeEnum } from '../../../platform/platform.schema.js';
import { TagQueryRepository } from '../../tag/persistence/tag.query.js';
import { Tx } from '../../../infra/db/types.js';
import { db } from '../../../infra/db/db.js';

@Injectable()
export class ChannelMapper {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly tagQuery: TagQueryRepository,
  ) {}

  async mapAll(entities: ChannelEnt[], tx: Tx = db) {
    return Promise.all(entities.map((ent) => this.map(ent, tx)));
  }

  async mapNullable(ent: ChannelEnt | undefined, tx: Tx = db) {
    if (!ent) return undefined;
    return this.map(ent, tx);
  }

  async map(ent: ChannelEnt, tx: Tx = db): Promise<ChannelRecord> {
    const platformStr = notNull(await this.pfRepo.findById(ent.platformId, tx)).name;
    const priorityStr = notNull(await this.priRepo.findById(ent.priorityId, tx)).name;
    return {
      ...ent,
      platformName: platformTypeEnum.parse(platformStr),
      priorityName: priorityStr,
    };
  }

  async loadRelations(
    channels: ChannelRecord[],
    withTags: boolean = false,
    tx: Tx = db,
  ): Promise<ChannelRecord[]> {
    if (!withTags) return channels;
    const promises = channels.map(async (channel) => ({
      ...channel,
      tags: await this.tagQuery.findTagsByChannelId(channel.id, tx),
    }));
    return Promise.all(promises);
  }

  async loadRelation(
    channels: ChannelRecord,
    withTags: boolean = false,
    tx: Tx = db,
  ): Promise<ChannelRecord> {
    if (!withTags) return channels;
    return {
      ...channels,
      tags: await this.tagQuery.findTagsByChannelId(channels.id, tx),
    };
  }
}
