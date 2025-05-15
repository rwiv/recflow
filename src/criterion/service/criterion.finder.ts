import { Injectable } from '@nestjs/common';
import { CriterionRepository } from '../storage/criterion.repository.js';
import { CriterionMapper } from './criterion.mapper.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ChzzkCriterionDto, PlatformCriterionDto, SoopCriterionDto } from '../spec/criterion.dto.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';
import { CriterionEnt } from '../spec/criterion.entity.schema.js';
import { PlatformDto } from '../../platform/spec/storage/platform.dto.schema.js';

@Injectable()
export class CriterionFinder {
  constructor(
    private readonly crRepo: CriterionRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly mapper: CriterionMapper,
  ) {}

  async findAll(): Promise<PlatformCriterionDto[]> {
    const entities = await this.crRepo.findAll();
    const promises = entities.map(async (ent) => {
      return this.map(ent, await this.pfFinder.findByIdNotNull(ent.platformId));
    });
    return Promise.all(promises);
  }

  async findById(id: string, tx: Tx = db): Promise<PlatformCriterionDto | null> {
    const ent = await this.crRepo.findById(id, tx);
    if (!ent) return null;
    const platform = await this.pfFinder.findByIdNotNull(ent.platformId);
    return this.map(ent, platform, tx);
  }

  private map(ent: CriterionEnt, platform: PlatformDto, tx: Tx = db): Promise<PlatformCriterionDto> {
    if (platform.name === 'chzzk') {
      return this.mapper.mapToChzzk({ ...ent, platform }, tx);
    } else if (platform.name === 'soop') {
      return this.mapper.mapToSoop({ ...ent, platform }, tx);
    } else {
      throw new EnumCheckError(`Invalid platform name: name=${platform.name}`);
    }
  }

  async findChzzkCriteria(): Promise<ChzzkCriterionDto[]> {
    const platform = await this.pfFinder.findByNameNotNull('chzzk');
    const entities = await this.crRepo.findByPlatformId(platform.id);
    const promises = entities.map((ent) => this.mapper.mapToChzzk({ ...ent, platform }));
    return Promise.all(promises);
  }

  async findSoopCriteria(): Promise<SoopCriterionDto[]> {
    const platform = await this.pfFinder.findByNameNotNull('soop');
    const entities = await this.crRepo.findByPlatformId(platform.id);
    const promises = entities.map((ent) => this.mapper.mapToSoop({ ...ent, platform }));
    return Promise.all(promises);
  }
}
