import { Injectable } from '@nestjs/common';
import { LiveRepository } from '../persistence/live.repository.js';
import { LiveMapOpt, LiveMapper } from './live.mapper.js';
import { oneNullable } from '../../utils/list.js';
import { LiveEnt } from '../persistence/live.persistence.schema.js';

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
    const ent = await this.liveRepo.findById(id);
    return this.filterByOpts(ent, opts);
  }

  async findByPid(pid: string, opts: FindOptions = {}) {
    const ent = oneNullable(await this.liveRepo.findByPid(pid));
    return this.filterByOpts(ent, opts);
  }

  private async filterByOpts(ent: LiveEnt | undefined, opts: FindOptions = {}) {
    let withDeleted = opts.withDeleted;
    if (withDeleted === undefined) {
      withDeleted = false;
    }
    if (!ent) return undefined;
    if (ent.isDeleted && !withDeleted) return undefined;
    return this.mapper.map(ent);
  }

  async findAll(opt: LiveMapOpt = {}) {
    return this.mapper.mapAll(await this.liveRepo.findAll(), opt);
  }

  async findAllActives(opt: LiveMapOpt = {}) {
    return this.mapper.mapAll(await this.liveRepo.findByIsDeleted(false), opt);
  }

  async findAllDeleted(opt: LiveMapOpt = {}) {
    return this.mapper.mapAll(await this.liveRepo.findByIsDeleted(true), opt);
  }
}
