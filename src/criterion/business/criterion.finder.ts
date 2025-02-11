import { Injectable } from '@nestjs/common';
import { CriterionRepository } from '../persistence/criterion.repository.js';
import { CriterionMapper } from './criterion.mapper.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class CriterionFinder {
  constructor(
    private readonly crRepo: CriterionRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly mapper: CriterionMapper,
  ) {}

  async findAll() {
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

  async findChzzkByName(name: string) {
    const ent = await this.crRepo.findByName(name);
    if (!ent) return undefined;
    const platform = await this.pfFinder.findByIdNotNull(ent.platformId);
    return this.mapper.mapToChzzk({ ...ent, platform });
  }

  async findSoopByName(name: string) {
    const ent = await this.crRepo.findByName(name);
    if (!ent) return undefined;
    const platform = await this.pfFinder.findByIdNotNull(ent.platformId);
    return this.mapper.mapToSoop({ ...ent, platform });
  }
}
