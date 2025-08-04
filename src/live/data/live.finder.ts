import { Injectable } from '@nestjs/common';
import { LiveRepository } from '../storage/live.repository.js';
import { LiveFieldsReq, LiveMapper } from './live.mapper.js';
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
      if (!ent) return null;
      return this.mapper.map(ent, tx, opts);
    } else {
      const ent = await this.liveRepo.findById(id, tx);
      if (!ent) return null;
      return this.mapper.map(ent, tx, opts);
    }
  }

  async findByChannelSourceId(channelSourceId: string, opts: FindOptions = {}, tx: Tx = db) {
    const entities = await this.liveRepo.findByChannelSourceId(channelSourceId, tx);
    return this.mapper.mapAll(entities, tx, opts);
  }

  async findByNodeId(nodeId: string, opts: FindOptions = {}, tx: Tx = db) {
    const entities = await this.liveRepo.findByNodeId(nodeId, tx);
    return this.mapper.mapAll(entities, tx, opts);
  }

  async findAll(opts: LiveFieldsReq = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findAll(), tx, opts);
  }

  async findAllActives(opts: LiveFieldsReq = {}, tx: Tx = db) {
    return this.mapper.mapAll(await this.liveRepo.findByIsDisabled(false), tx, opts);
  }

  async findEarliestUpdatedOne(tx: Tx = db): Promise<LiveDto | null> {
    const entities = await this.liveRepo.findEarliestUpdated(1, tx);
    if (entities.length === 0) {
      return null;
    }
    if (entities.length !== 1) {
      throw new ConflictError(`Invalid live entities: length=${entities.length}`);
    }
    return this.mapper.map(entities[0], tx);
  }
}
