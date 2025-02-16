import { ChannelCommandRepository } from '../storage/channel.command.js';
import { Injectable } from '@nestjs/common';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelEntUpdate } from '../spec/channel.entity.schema.js';
import { PriorityRepository } from '../storage/priority.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class ChannelUpdater {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly priRepo: PriorityRepository,
    private readonly chMapper: ChannelMapper,
  ) {}

  async updatePriority(id: string, priorityName: string) {
    const priority = await this.priRepo.findByName(priorityName);
    if (!priority) throw NotFoundError.from('Priority', 'name', priorityName);
    return this.update(id, { priorityId: priority.id });
  }

  async updateFollowed(id: string, isFollowed: boolean) {
    return this.update(id, { isFollowed });
  }

  async updateDescription(id: string, description: string | null) {
    return this.update(id, { description });
  }

  private async update(id: string, req: ChannelEntUpdate) {
    const ent = await this.chCmd.update(id, req);
    return this.chMapper.map(ent);
  }
}
