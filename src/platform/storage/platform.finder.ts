import { Injectable } from '@nestjs/common';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformRepository } from './platform.repository.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { platformDto } from '../spec/storage/platform.dto.schema.js';

@Injectable()
export class PlatformFinder {
  constructor(private readonly pfRepo: PlatformRepository) {}

  async findAll(tx: Tx = db) {
    return (await this.pfRepo.findAll()).map((it) => platformDto.parse(it));
  }

  async findByIdNotNull(id: string, tx: Tx = db) {
    const platform = await this.findById(id, tx);
    if (!platform) throw NotFoundError.from('Platform', 'id', id);
    return platform;
  }

  async findById(id: string, tx: Tx = db) {
    const ent = await this.pfRepo.findById(id, tx);
    if (!ent) return null;
    return platformDto.parse(ent);
  }

  async findByNameNotNull(name: PlatformName, tx: Tx = db) {
    const platform = await this.findByName(name, tx);
    if (!platform) throw NotFoundError.from('Platform', 'name', name);
    return platform;
  }

  async findByName(name: PlatformName, tx: Tx = db) {
    const ent = await this.pfRepo.findByName(name, tx);
    if (!ent) return null;
    return platformDto.parse(ent);
  }
}
