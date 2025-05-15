import { Injectable } from '@nestjs/common';
import { PlatformEntAppend, PlatformRepository } from './platform.repository.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { PlatformCacheStore } from './platform.cache.store.js';
import { PlatformDto, platformDto } from '../spec/storage/platform.dto.schema.js';

@Injectable()
export class PlatformWriter {
  constructor(
    private readonly pfRepo: PlatformRepository,
    private readonly cache: PlatformCacheStore,
  ) {}

  async create(append: PlatformEntAppend, tx: Tx = db): Promise<PlatformDto> {
    const dto = platformDto.parse(await this.pfRepo.create(append, tx));
    await this.cache.set(dto);
    return dto;
  }
}
