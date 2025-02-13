import { Injectable } from '@nestjs/common';
import { PriorityRepository } from '../storage/priority.repository.js';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { PriorityAppend } from '../spec/channel.dto.schema.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';

@Injectable()
export class PriorityWriter {
  constructor(
    private readonly priRepo: PriorityRepository,
    private readonly channelRepo: ChannelQueryRepository,
  ) {}

  async create(append: PriorityAppend) {
    const existing = await this.priRepo.findByName(append.name);
    if (existing) {
      throw new ConflictError('Priority name already exists');
    }
    return this.priRepo.create(append);
  }

  async delete(id: string) {
    const channels = await this.channelRepo.findByPriorityId(id);
    if (channels.length > 0) {
      throw new ValidationError('Cannot delete priority with associated channels');
    }
    await this.priRepo.delete(id);
  }
}
