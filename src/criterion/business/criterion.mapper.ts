import { Injectable } from '@nestjs/common';
import { CriterionUnitEnt } from '../persistence/criterion.persistence.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import {
  ChzzkCriterionRecord,
  CriterionRecord,
  SoopCriterionRecord,
} from './criterion.business.schema.js';
import { CriterionUnitRepository } from '../persistence/criterion-unit.repository.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { CriterionRuleService } from './criterion.rule.js';

@Injectable()
export class CriterionMapper {
  constructor(
    private readonly unitRepo: CriterionUnitRepository,
    private readonly ruleService: CriterionRuleService,
  ) {}

  async mapToChzzk(criterion: CriterionRecord, tx: Tx = db): Promise<ChzzkCriterionRecord> {
    if (criterion.platform.name !== 'chzzk') {
      throw new ValidationError('Criterion is not a CHZZK platform');
    }
    const units = await this.unitRepo.findByCriterionId(criterion.id, tx);
    const { tagRule, keywordRule, wpRule } = await this.ruleService.findChzzkRules(tx);
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

  async mapToSoop(criterion: CriterionRecord, tx: Tx = db): Promise<SoopCriterionRecord> {
    if (criterion.platform.name !== 'soop') {
      throw new ValidationError('Criterion is not a SOOP platform');
    }
    const units = await this.unitRepo.findByCriterionId(criterion.id, tx);
    const { cateRule } = await this.ruleService.findSoopRules(tx);
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
