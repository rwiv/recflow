import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { platformDto } from '@/platform/spec/storage/platform.dto.schema.js';
import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';
import { PlatformCacheStore } from '@/platform/storage/platform.cache.store.js';
import { PlatformRepository } from '@/platform/storage/platform.repository.js';

@Injectable()
export class PlatformFinder {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly cache: PlatformCacheStore,
  ) {}

  async findAll(tx: Tx = db) {
    return (await this.pfRepo.findAll()).map((it) => platformDto.parse(it));
  }

  async findByIdNotNull(id: string, tx: Tx = db) {
    const platform = await this.findById(id, tx);
    if (!platform) throw NotFoundError.from('Platform', 'id', id);
    return platform;
  }

  async findById(id: string, tx: Tx = db) {
    const cache = await this.cache.findById(id);
    if (cache) return cache;

    const ent = await this.pfRepo.findById(id, tx);
    if (!ent) return null;
    const dto = platformDto.parse(ent);

    await this.cache.set(dto);
    return dto;
  }

  async findByNameNotNull(name: PlatformName, tx: Tx = db) {
    const platform = await this.findByName(name, tx);
    if (!platform) throw NotFoundError.from('Platform', 'name', name);
    return platform;
  }

  async findByName(name: PlatformName, tx: Tx = db) {
    const cache = await this.cache.findByName(name);
    if (cache) return cache;

    const ent = await this.pfRepo.findByName(name, tx);
    if (!ent) return null;
    const dto = platformDto.parse(ent);

    await this.cache.set(dto);
    return dto;
  }
}
