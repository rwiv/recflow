import { Injectable } from '@nestjs/common';
import { CriterionRepository } from '../persistence/criterion.repository.js';
import { CriterionMapper } from './criterion.mapper.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ChzzkCriterionRecord, SoopCriterionRecord } from './criterion.business.schema.js';

@Injectable()
export class CriterionFinder {
  constructor(
    private readonly crRepo: CriterionRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly mapper: CriterionMapper,
  ) {}

  async findAll(): Promise<(ChzzkCriterionRecord | SoopCriterionRecord)[]> {
    const entities = await this.crRepo.findAll();
    const promises = entities.map(async (ent) => {
      const platform = await this.pfFinder.findByIdNotNull(ent.platformId);
      if (platform.name === 'chzzk') {
        return this.mapper.mapToChzzk({ ...ent, platform });
      } else if (platform.name === 'soop') {
        return this.mapper.mapToSoop({ ...ent, platform });
      } else {
        throw new ValidationError(`Invalid platform name: name=${platform.name}`);
      }
    });
    return Promise.all(promises);
  }

  async findChzzkCriteria(): Promise<ChzzkCriterionRecord[]> {
    const platform = await this.pfFinder.findByNameNotNull('chzzk');
    const entities = await this.crRepo.findByPlatformId(platform.id);
    const promises = entities.map((ent) => this.mapper.mapToChzzk({ ...ent, platform }));
    return Promise.all(promises);
  }

  async findSoopCriteria(): Promise<SoopCriterionRecord[]> {
    const platform = await this.pfFinder.findByNameNotNull('soop');
    const entities = await this.crRepo.findByPlatformId(platform.id);
    const promises = entities.map((ent) => this.mapper.mapToSoop({ ...ent, platform }));
    return Promise.all(promises);
  }
}
