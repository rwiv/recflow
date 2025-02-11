import { Injectable } from '@nestjs/common';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { LiveCriterionEnt } from '../persistence/criterion.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { liveCriterionRecord, LiveCriterionRecord } from './criterion.business.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { platformRecord } from '../../platform/platform.schema.js';

@Injectable()
export class CriterionMapper {
  constructor(private readonly pfRepo: PlatformRepository) {}

  async mapToRecord(ent: LiveCriterionEnt, tx: Tx = db) {
    const platform = await this.pfRepo.findById(ent.platformId, tx);
    if (!platform) throw NotFoundError.from('Platform', 'id', ent.platformId);
    const record: LiveCriterionRecord = {
      ...ent,
      platform: platformRecord.parse(platform),
    };
    return liveCriterionRecord.parse(record);
  }
}
