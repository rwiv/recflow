import { Injectable } from '@nestjs/common';
import { CriterionEnt, CriterionUnitEnt } from '../persistence/criterion.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import {
  CHZZK_CRITERION_RULES,
  liveCriterionRecord,
  LiveCriterionRecord,
  SOOP_CRITERION_RULES,
} from './criterion.business.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { CriterionRuleRepository } from '../persistence/criterion-rule.repository.js';
import { CriterionUnitRepository } from '../persistence/criterion-unit.repository.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';

@Injectable()
export class CriterionMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly ruleRepo: CriterionRuleRepository,
    private readonly unitRepo: CriterionUnitRepository,
  ) {}

  async mapToChzzk(ent: CriterionEnt, tx: Tx = db) {
    const record = await this.mapToRecord(ent, tx);
    const tagRule = await this.ruleRepo.findByNameNotNull(CHZZK_CRITERION_RULES.chzzk_tag_name, tx);
    const keywordRule = await this.ruleRepo.findByNameNotNull(
      CHZZK_CRITERION_RULES.chzzk_keyword_name,
      tx,
    );
    const wpRule = await this.ruleRepo.findByNameNotNull(
      CHZZK_CRITERION_RULES.chzzk_watch_party_no,
      tx,
    );

    const units = await this.unitRepo.findByCriterionId(record.id, tx);
    const { positive: positiveTags, negative: negativeTags } = this.findUnitsValues(
      units,
      tagRule.id,
    );
    const { positive: positiveKeywords, negative: negativeKeywords } = this.findUnitsValues(
      units,
      keywordRule.id,
    );
    const { positive: positiveWps, negative: negativeWps } = this.findUnitsValues(units, wpRule.id);
    return {
      ...record,
      positiveTags,
      negativeTags,
      positiveKeywords,
      negativeKeywords,
      positiveWps,
      negativeWps,
    };
  }

  async mapToSoop(ent: CriterionEnt, tx: Tx = db) {
    const record = await this.mapToRecord(ent, tx);
    const cateRule = await this.ruleRepo.findByNameNotNull(SOOP_CRITERION_RULES.soop_cate_no, tx);

    const units = await this.unitRepo.findByCriterionId(record.id, tx);
    const { positive: positiveCates, negative: negativeCates } = this.findUnitsValues(
      units,
      cateRule.id,
    );

    return {
      ...record,
      positiveCates,
      negativeCates,
    };
  }

  private findUnitsValues(units: CriterionUnitEnt[], ruleId: string) {
    const positive = units.filter((u) => u.positive && u.ruleId === ruleId).map((u) => u.value);
    const negative = units.filter((u) => !u.positive && u.ruleId === ruleId).map((u) => u.value);
    return { positive, negative };
  }

  private async mapToRecord(ent: CriterionEnt, tx: Tx = db) {
    const platform = await this.pfFinder.findByIdNotNull(ent.platformId, tx);
    if (!platform) throw NotFoundError.from('Platform', 'id', ent.platformId);
    const record: LiveCriterionRecord = { ...ent, platform };
    return liveCriterionRecord.parse(record);
  }
}
