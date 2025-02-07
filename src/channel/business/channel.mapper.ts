import { Injectable } from '@nestjs/common';
import { channelRecord, ChannelRecord } from './channel.schema.js';
import { assertNotNull } from '../../utils/null.js';
import { PlatformRepository } from '../persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';
import { ChannelEnt } from '../persistence/channel.schema.js';
import { platformType } from '../../common/schema.js';

@Injectable()
export class ChannelMapper {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly priRepo: ChannelPriorityRepository,
  ) {}

  async mapAll(entities: ChannelEnt[]): Promise<ChannelRecord[]> {
    return Promise.all(entities.map((ent) => this.map(ent)));
  }

  async mapNullable(ent: ChannelEnt | undefined): Promise<ChannelRecord | undefined> {
    if (!ent) return undefined;
    return this.map(ent);
  }

  async map(ent: ChannelEnt): Promise<ChannelRecord> {
    const platformStr = assertNotNull(await this.pfRepo.findById(ent.platformId)).name;
    const priorityStr = assertNotNull(await this.priRepo.findById(ent.priorityId)).name;
    return channelRecord.parse({
      ...ent,
      platformName: platformType.parse(platformStr),
      priorityName: priorityStr,
    });
  }
}
