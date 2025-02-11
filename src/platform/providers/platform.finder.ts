import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformRepository } from './platform.repository.js';
import { platformRecord, PlatformType } from './platform.business.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

@Injectable()
export class PlatformFinder {
  constructor(private readonly pfRepo: PlatformRepository) {}

  async findAll(tx: Tx = db) {
    return (await this.pfRepo.findAll()).map((it) => platformRecord.parse(it));
  }

  async findByIdNotNull(id: string, tx: Tx = db) {
    const platform = await this.findById(id, tx);
    if (!platform) throw NotFoundError.from('Platform', 'id', id);
    return platform;
  }

  async findById(id: string, tx: Tx = db) {
    const ent = await this.pfRepo.findById(id, tx);
    if (!ent) return undefined;
    return platformRecord.parse(ent);
  }

  async findByNameNotNull(name: PlatformType, tx: Tx = db) {
    const platform = await this.findByName(name, tx);
    if (!platform) throw NotFoundError.from('Platform', 'name', name);
    return platform;
  }

  async findByName(name: PlatformType, tx: Tx = db) {
    const ent = await this.pfRepo.findByName(name, tx);
    if (!ent) return undefined;
    return platformRecord.parse(ent);
  }
}
