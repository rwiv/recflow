import { Injectable } from '@nestjs/common';
import { CriterionUnitEnt } from '../persistence/criterion.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import {
  CHZZK_CRITERION_RULES,
  ChzzkCriterionRecord,
  LiveCriterionRecord,
  SOOP_CRITERION_RULES,
  SoopCriterionRecord,
} from './criterion.business.schema.js';
import { CriterionRuleRepository } from '../persistence/criterion-rule.repository.js';
import { CriterionUnitRepository } from '../persistence/criterion-unit.repository.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@Injectable()
export class CriterionMapper {
  constructor(
    private readonly pfFinder: PlatformFinder,
    private readonly ruleRepo: CriterionRuleRepository,
    private readonly unitRepo: CriterionUnitRepository,
  ) {}

  async mapToChzzk(criterion: LiveCriterionRecord, tx: Tx = db): Promise<ChzzkCriterionRecord> {
    if (criterion.platform.name === 'chzzk') {
      throw new ValidationError('Criterion is not a CHZZK platform');
    }
    const units = await this.unitRepo.findByCriterionId(criterion.id, tx);

    const tagRuleName = CHZZK_CRITERION_RULES.chzzk_tag_name;
    const keywordRuleName = CHZZK_CRITERION_RULES.chzzk_keyword_name;
    const wpRuleName = CHZZK_CRITERION_RULES.chzzk_watch_party_no;
    const tagRule = await this.ruleRepo.findByNameNotNull(tagRuleName, tx);
    const keywordRule = await this.ruleRepo.findByNameNotNull(keywordRuleName, tx);
    const wpRule = await this.ruleRepo.findByNameNotNull(wpRuleName, tx);

    const tags = this.findUnitsValues(units, tagRule.id);
    const keywords = this.findUnitsValues(units, keywordRule.id);
    const wps = this.findUnitsValues(units, wpRule.id);
    return {
      ...criterion,
      positiveTags: tags.positive,
      negativeTags: tags.negative,
      positiveKeywords: keywords.positive,
      negativeKeywords: keywords.negative,
      positiveWps: wps.positive,
      negativeWps: wps.negative,
    };
  }

  async mapToSoop(criterion: LiveCriterionRecord, tx: Tx = db): Promise<SoopCriterionRecord> {
    if (criterion.platform.name === 'soop') {
      throw new ValidationError('Criterion is not a SOOP platform');
    }
    const units = await this.unitRepo.findByCriterionId(criterion.id, tx);

    const cateRuleName = SOOP_CRITERION_RULES.soop_cate_no;
    const cateRule = await this.ruleRepo.findByNameNotNull(cateRuleName, tx);

    const cates = this.findUnitsValues(units, cateRule.id);
    return {
      ...criterion,
      positiveCates: cates.positive,
      negativeCates: cates.negative,
    };
  }

  private findUnitsValues(units: CriterionUnitEnt[], ruleId: string) {
    const positive = units.filter((u) => u.positive && u.ruleId === ruleId).map((u) => u.value);
    const negative = units.filter((u) => !u.positive && u.ruleId === ruleId).map((u) => u.value);
    return { positive, negative };
  }
}
