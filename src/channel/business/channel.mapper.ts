import { Injectable } from '@nestjs/common';
import { channelRecord, ChannelRecord } from './channel.schema.js';
import { notNull } from '../../utils/null.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';
import { ChannelEnt } from '../persistence/channel.schema.js';
import { platformType } from '../../platform/schema.js';

@Injectable()
export class ChannelMapper {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
  ) {}

  async mapAll(entities: ChannelEnt[]) {
    return Promise.all(entities.map((ent) => this.map(ent)));
  }

  async mapNullable(ent: ChannelEnt | undefined) {
    if (!ent) return undefined;
    return this.map(ent);
  }

  async map(ent: ChannelEnt): Promise<ChannelRecord> {
    const platformStr = notNull(await this.pfRepo.findById(ent.platformId)).name;
    const priorityStr = notNull(await this.priRepo.findById(ent.priorityId)).name;
    const record: ChannelRecord = {
      ...ent,
      platformName: platformType.parse(platformStr),
      priorityName: priorityStr,
    };
    return channelRecord.parse(record);
  }
}
