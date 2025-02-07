import { Injectable } from '@nestjs/common';
import { ChannelEnt } from '../persistence/channel.types.js';
import { ChannelRecord } from './channel.types.js';
import { assertNotNull } from '../../utils/null.js';
import { checkType } from '../../../web/src/lib/union.js';
import { PLATFORM_TYPES } from '../../common/enum.consts.js';
import { CHANNEL_PRIORITIES } from '../priority/consts.js';
import { PlatformRepository } from '../persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';

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
    return {
      ...ent,
      platform: assertNotNull(checkType(platformStr, PLATFORM_TYPES)),
      priority: assertNotNull(checkType(priorityStr, CHANNEL_PRIORITIES)),
    };
  }
}
