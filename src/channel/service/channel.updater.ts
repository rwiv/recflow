import { ChannelCommandRepository } from '../storage/channel.command.js';
import { Injectable } from '@nestjs/common';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelEntUpdate } from '../storage/channel.entity.schema.js';
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
    const update: ChannelEntUpdate = { id, form: { priorityId: priority.id } };
    return this.update(update);
  }

  async updateFollowed(id: string, followed: boolean) {
    const update: ChannelEntUpdate = { id, form: { followed } };
    return this.update(update);
  }

  async updateDescription(id: string, description: string | null) {
    const update: ChannelEntUpdate = { id, form: { description } };
    return this.update(update);
  }

  private async update(req: ChannelEntUpdate) {
    const ent = await this.chCmd.update(req);
    return this.chMapper.map(ent);
  }
}
