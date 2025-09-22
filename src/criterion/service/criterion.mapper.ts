import { Injectable } from '@nestjs/common';
import { CriterionUnitEnt } from '../spec/criterion.entity.schema.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ChzzkCriterionDto, CriterionDto, SoopCriterionDto } from '../spec/criterion.dto.schema.js';
import { CriterionUnitRepository } from '../storage/criterion-unit.repository.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { CriterionRuleFinder } from './criterion.rule.finder.js';

@Injectable()
export class CriterionMapper {
  constructor(
    private readonly unitRepo: CriterionUnitRepository,
    private readonly ruleFinder: CriterionRuleFinder,
  ) {}

  async mapToChzzk(criterion: CriterionDto, tx: Tx = db): Promise<ChzzkCriterionDto> {
    if (criterion.platform.name !== 'chzzk') {
      throw new ValidationError('Criterion is not a CHZZK platform');
    }
    const units = await this.unitRepo.findByCriterionId(criterion.id, tx);
    const { tagRule, keywordRule, wpRule } = await this.ruleFinder.findChzzkRules(tx);
    const tags = this.findUnitsValues(units, tagRule.id);
    const keywords = this.findUnitsValues(units, keywordRule.id);
    const wps = this.findUnitsValues(units, wpRule.id);
    return {
      ...criterion,
      tagRuleId: tagRule.id,
      keywordRuleId: keywordRule.id,
      wpRuleId: wpRule.id,
      positiveTags: tags.positive,
      negativeTags: tags.negative,
      positiveKeywords: keywords.positive,
      negativeKeywords: keywords.negative,
      positiveWps: wps.positive,
      negativeWps: wps.negative,
    };
  }

  async mapToSoop(criterion: CriterionDto, tx: Tx = db): Promise<SoopCriterionDto> {
    if (criterion.platform.name !== 'soop') {
      throw new ValidationError('Criterion is not a SOOP platform');
    }
    const units = await this.unitRepo.findByCriterionId(criterion.id, tx);
    const { tagRule, keywordRule, cateRule } = await this.ruleFinder.findSoopRules(tx);
    const tags = this.findUnitsValues(units, tagRule.id);
    const keywords = this.findUnitsValues(units, keywordRule.id);
    const cates = this.findUnitsValues(units, cateRule.id);
    return {
      ...criterion,
      tagRuleId: tagRule.id,
      keywordRuleId: keywordRule.id,
      cateRuleId: cateRule.id,
      positiveTags: tags.positive,
      negativeTags: tags.negative,
      positiveKeywords: keywords.positive,
      negativeKeywords: keywords.negative,
      positiveCates: cates.positive,
      negativeCates: cates.negative,
    };
  }

  private findUnitsValues(units: CriterionUnitEnt[], ruleId: string) {
    const positive = units
      .filter((u) => u.isPositive && u.ruleId === ruleId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const negative = units
      .filter((u) => !u.isPositive && u.ruleId === ruleId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return { positive, negative };
  }
}
