import { Injectable } from '@nestjs/common';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { PlatformDto, platformDto } from '@/platform/spec/storage/platform.dto.schema.js';
import { PlatformCacheStore } from '@/platform/storage/platform.cache.store.js';
import { PlatformEntAppend, PlatformRepository } from '@/platform/storage/platform.repository.js';

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
