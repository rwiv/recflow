import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { Injectable } from '@nestjs/common';
import { ChannelRecord } from './channel.schema.js';
import { ChannelMapper } from './channel.mapper.js';
import { ChannelEntUpdate } from '../persistence/channel.schema.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class ChannelUpdater {
  constructor(
    private readonly chCmd: ChannelCommandRepository,
    private readonly priRepo: ChannelPriorityRepository,
    private readonly chMapper: ChannelMapper,
  ) {}

  async updatePriority(id: string, priorityName: string): Promise<ChannelRecord> {
    const priority = await this.priRepo.findByName(priorityName);
    if (!priority) throw new NotFoundError('Priority not found');
    return this.updateRecord({ id, form: { priorityId: priority.id } });
  }

  async updateFollowed(id: string, followed: boolean): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { followed } });
  }

  async updateDescription(id: string, description: string | null): Promise<ChannelRecord> {
    return this.updateRecord({ id, form: { description } });
  }

  private async updateRecord(req: ChannelEntUpdate): Promise<ChannelRecord> {
    const ent = await this.chCmd.update(req);
    return this.chMapper.map(ent);
  }
}
