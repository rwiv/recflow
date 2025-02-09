import { Injectable } from '@nestjs/common';
import { LiveRepository } from '../persistence/live.repository.js';
import { LiveMapper } from './live.mapper.js';
import { oneNullable } from '../../utils/list.js';

export interface FindOptions {
  withDeleted?: boolean;
}

@Injectable()
export class LiveFinder {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly mapper: LiveMapper,
  ) {}

  async findById(id: string, opts: FindOptions = {}) {
    let withDeleted = opts.withDeleted;
    if (withDeleted === undefined) {
      withDeleted = false;
    }
    const ent = oneNullable(await this.liveRepo.findByPid(id));
    if (!ent) return undefined;
    if (ent.isDeleted && !withDeleted) return undefined;
    return this.mapper.map(ent);
  }

  async findByPid(pid: string, opts: FindOptions = {}) {
    let withDeleted = opts.withDeleted;
    if (withDeleted === undefined) {
      withDeleted = false;
    }
    const ent = oneNullable(await this.liveRepo.findByPid(pid));
    if (!ent) return undefined;
    if (ent.isDeleted && !withDeleted) return undefined;
    return this.mapper.map(ent);
  }

  async findAll() {
    return this.mapper.mapAll(await this.liveRepo.findAll());
  }

  async findAllActives() {
    return this.mapper.mapAll(await this.liveRepo.findByIsDeleted(false));
  }

  async findAllDeleted() {
    return this.mapper.mapAll(await this.liveRepo.findByIsDeleted(true));
  }
}
