import { Injectable } from '@nestjs/common';
import { PriorityRepository } from '../storage/priority.repository.js';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PriorityAppend, PriorityDto, PriorityUpdate } from '../spec/priority.schema.js';

@Injectable()
export class PriorityService {
  constructor(
    private readonly priRepo: PriorityRepository,
    private readonly channelRepo: ChannelQueryRepository,
  ) {}

  findAll(): Promise<PriorityDto[]> {
    return this.priRepo.findAll();
  }

  findById(id: string, tx: Tx = db): Promise<PriorityDto | null> {
    return this.priRepo.findById(id, tx);
  }

  async findByIdNotNull(id: string, tx: Tx = db): Promise<PriorityDto> {
    const priority = await this.findById(id, tx);
    if (!priority) throw NotFoundError.from('Priority', 'id', id);
    return priority;
  }

  findByName(name: string, tx: Tx = db): Promise<PriorityDto | null> {
    return this.priRepo.findByName(name, tx);
  }

  async findByNameNotNull(name: string, tx: Tx = db): Promise<PriorityDto> {
    const priority = await this.findByName(name, tx);
    if (!priority) throw NotFoundError.from('Priority', 'name', name);
    return priority;
  }

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

  async update(id: string, update: PriorityUpdate, tx: Tx = db) {
    return this.priRepo.update(id, update, tx);
  }
}
