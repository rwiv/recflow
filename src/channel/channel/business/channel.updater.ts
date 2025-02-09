import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { Injectable } from '@nestjs/common';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelEntUpdate } from '../persistence/channel.persistence.schema.js';
import { ChannelPriorityRepository } from '../persistence/priority.repository.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class ChannelUpdater {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly chMapper: ChannelMapper,
  ) {}

  async updatePriority(id: string, priorityName: string) {
    const priority = await this.priRepo.findByName(priorityName);
    if (!priority) throw new NotFoundError('Priority not found');
    const update: ChannelEntUpdate = { id, form: { priorityId: priority.id } };
    return this.updateRecord(update);
  }

  async updateFollowed(id: string, followed: boolean) {
    const update: ChannelEntUpdate = { id, form: { followed } };
    return this.updateRecord(update);
  }

  async updateDescription(id: string, description: string | null) {
    const update: ChannelEntUpdate = { id, form: { description } };
    return this.updateRecord(update);
  }

  private async updateRecord(req: ChannelEntUpdate) {
    const ent = await this.chCmd.update(req);
    return this.chMapper.map(ent);
  }
}
