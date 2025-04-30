import { Injectable } from '@nestjs/common';
import { LiveRepository } from '../storage/live.repository.js';
import { LiveFieldsReq, LiveMapper } from './live.mapper.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ConflictError } from '../../utils/errors/errors/ConflictError.js';
import { LiveDto } from '../spec/live.dto.schema.js';

export interface FindOptions extends LiveFieldsReq {
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
      if (!ent) return undefined;
      return this.mapper.map(ent, tx, opts);
    } else {
      const ent = await this.liveRepo.findById(id, tx);
      if (!ent) return undefined;
      return this.mapper.map(ent, tx, opts);
    }
  }

  async findByPid(pid: string, tx: Tx = db, opts: FindOptions = {}) {
    const entities = await this.liveRepo.findByPid(pid, tx);
    if (entities.length === 0) return undefined;
    if (entities.length > 1) throw new ValidationError(`Duplicated live entities: pid=${pid}`);
    const ent = entities[0];
    if (!ent) return undefined;
    return this.mapper.map(ent, tx, opts);
  }

  async findAll(opt: LiveFieldsReq = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findAll(), tx, opt);
  }

  async findAllActives(opt: LiveFieldsReq = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findByIsDisabled(false), tx, opt);
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
