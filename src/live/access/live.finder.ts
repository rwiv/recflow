import { Injectable } from '@nestjs/common';
import { LiveRepository } from '../storage/live.repository.js';
import { LiveMapOpt, LiveMapper } from './live.mapper.js';
import { LiveEnt } from '../spec/live.entity.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';

export interface FindOptions {
  withDisabled?: boolean;
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
    const entities = await this.liveRepo.findByPid(pid);
    if (entities.length === 0) return undefined;
    if (entities.length > 1) throw new ValidationError(`Duplicated live entities: pid=${pid}`);
    return this.filterByOpts(entities[0], opts);
  }

  private async filterByOpts(ent: LiveEnt | undefined, opts: FindOptions = {}) {
    let withDisabled = opts.withDisabled;
    if (withDisabled === undefined) {
      withDisabled = false;
    }
    if (!ent) return undefined;
    if (ent.isDisabled && !withDisabled) return undefined;
    return this.mapper.map(ent);
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
}
