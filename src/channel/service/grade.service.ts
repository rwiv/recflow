import { Injectable } from '@nestjs/common';
import { GradeRepository } from '../storage/grade.repository.js';
import { ChannelQueryRepository } from '../storage/channel.query.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { GradeAppend, GradeDto, GradeUpdate } from '../spec/grade.schema.js';
import { ChannelCacheStore } from '../storage/channel.cache.store.js';

@Injectable()
export class GradeService {
  constructor(
    private readonly grRepo: GradeRepository,
    private readonly channelRepo: ChannelQueryRepository,
    private readonly channelCache: ChannelCacheStore,
  ) {}

  findAll(): Promise<GradeDto[]> {
    return this.grRepo.findAll();
  }

  findById(id: string, tx: Tx = db): Promise<GradeDto | null> {
    return this.grRepo.findById(id, tx);
  }

  async findByIdNotNull(id: string, tx: Tx = db): Promise<GradeDto> {
    const ent = await this.findById(id, tx);
    if (!ent) throw NotFoundError.from('Grade', 'id', id);
    return ent;
  }

  findByName(name: string, tx: Tx = db): Promise<GradeDto | null> {
    return this.grRepo.findByName(name, tx);
  }

  async findByNameNotNull(name: string, tx: Tx = db): Promise<GradeDto> {
    const grade = await this.findByName(name, tx);
    if (!grade) throw NotFoundError.from('Grade', 'name', name);
    return grade;
  }

  async create(append: GradeAppend) {
    const existing = await this.grRepo.findByName(append.name);
    if (existing) {
      throw new ConflictError('Grade name already exists');
    }
    return this.grRepo.create(append);
  }

  async delete(id: string) {
    const channels = await this.channelRepo.findByGradeId(id);
    if (channels.length > 0) {
      throw new ValidationError('Cannot delete grade with associated channels');
    }
    await this.grRepo.delete(id);
  }

  async update(id: string, update: GradeUpdate, tx: Tx = db) {
    const result = await this.grRepo.update(id, update, tx);

    // Invalidate cache for channels with this grade
    const ids = await this.channelRepo.findIdsByGradeId(id, tx);
    const promises = [];
    for (const channelId of ids) {
      promises.push(this.channelCache.delete(channelId));
    }
    await Promise.all(promises);

    return result;
  }
}
