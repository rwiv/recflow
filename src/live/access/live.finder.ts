import { Injectable } from '@nestjs/common';
import { LiveRepository } from '../storage/live.repository.js';
import { LiveMapOpt, LiveMapper } from './live.mapper.js';
import { LiveEnt } from '../spec/live.entity.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { LiveDto } from '../spec/live.dto.schema.js';

export interface FindOptions extends LiveMapOpt {
  includeDisabled?: boolean;
  forUpdate?: boolean;
}

@Injectable()
export class LiveFinder {
  constructor(
    private readonly liveRepo: LiveRepository,
    private readonly mapper: LiveMapper,
  ) {}

  async findById(id: string, opts: FindOptions = {}, tx: Tx = db) {
    if (opts.forUpdate) {
      const ent = await this.liveRepo.findByIdForUpdate(id, tx);
      return this.filterByOpts(ent, opts);
    } else {
      const ent = await this.liveRepo.findById(id, tx);
      return this.filterByOpts(ent, opts);
    }
  }

  async findByPid(pid: string, tx: Tx = db, opts: FindOptions = {}) {
    const entities = await this.liveRepo.findByPid(pid, tx);
    if (entities.length === 0) return undefined;
    if (entities.length > 1) throw new ValidationError(`Duplicated live entities: pid=${pid}`);
    return this.filterByOpts(entities[0], opts);
  }

  private async filterByOpts(ent: LiveEnt | undefined, opts: FindOptions = {}, tx: Tx = db) {
    let withDisabled = opts.includeDisabled;
    if (withDisabled === undefined) {
      withDisabled = false;
    }
    if (!ent) return undefined;
    if (ent.isDisabled && !withDisabled) return undefined;
    return this.mapper.map(ent, tx, opts);
  }

  async findAll(opt: LiveMapOpt = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findAll(), tx, opt);
  }

  async findAllActives(opt: LiveMapOpt = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findByIsDeleted(false), tx, opt);
  }

  async findAllDeleted(opt: LiveMapOpt = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findByIsDeleted(true), tx, opt);
  }

  async findEarliestUpdatedOne(tx: Tx = db): Promise<LiveDto | undefined> {
    const entities = await this.liveRepo.findEarliestUpdated(1, tx);
    if (entities.length === 0) {
      return undefined;
    }
    if (entities.length !== 1) {
      throw new ConflictError(`Invalid live entities: length=${entities.length}`);
    }
    return this.mapper.map(entities[0], tx);
  }
}
