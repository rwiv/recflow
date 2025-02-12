import { Injectable } from '@nestjs/common';
import { CriterionRepository } from '../storage/criterion.repository.js';
import { CriterionUnitRepository } from '../storage/criterion-unit.repository.js';
import {
  ChzzkCriterionAppend,
  ChzzkCriterionRecord,
  SoopCriterionAppend,
  SoopCriterionRecord,
} from '../spec/criterion.dto.schema.js';
import {
  CriterionEnt,
  CriterionRuleEnt,
  CriterionUnitEnt,
  CriterionUnitEntAppend,
} from '../storage/criterion.entity.schema.js';
import { db } from '../../infra/db/db.js';
import { PlatformFinder } from '../../platform/storage/platform.finder.js';
import { CriterionRuleFinder } from './criterion.rule.finder.js';

@Injectable()
export class CriterionWriter {
  constructor(
    private readonly criterionRepo: CriterionRepository,
    private readonly unitRepo: CriterionUnitRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly ruleFinder: CriterionRuleFinder,
  ) {}

  async createChzzkCriterion(append: ChzzkCriterionAppend): Promise<ChzzkCriterionRecord> {
    const platform = await this.pfFinder.findByIdNotNull(append.platformId);
    const { tagRule, keywordRule: kwRule, wpRule } = await this.ruleFinder.findChzzkRules();

    return db.transaction(async (tx) => {
      const ent = await this.criterionRepo.create(append, tx);
      const promises: Promise<CriterionUnitEnt>[] = [];
      for (const tagName of append.positiveTags) {
        promises.push(this.unitRepo.create(unitAppend(ent, tagRule, tagName, true), tx));
      }
      for (const tagName of append.negativeTags) {
        promises.push(this.unitRepo.create(unitAppend(ent, tagRule, tagName, false), tx));
      }
      for (const kwName of append.positiveKeywords) {
        promises.push(this.unitRepo.create(unitAppend(ent, kwRule, kwName, true), tx));
      }
      for (const kwName of append.negativeKeywords) {
        promises.push(this.unitRepo.create(unitAppend(ent, kwRule, kwName, false), tx));
      }
      for (const wpNo of append.positiveWps) {
        promises.push(this.unitRepo.create(unitAppend(ent, wpRule, wpNo, true), tx));
      }
      for (const wpNo of append.negativeWps) {
        promises.push(this.unitRepo.create(unitAppend(ent, wpRule, wpNo, false), tx));
      }
      const unitEntities = await Promise.all(promises);
      return {
        ...ent,
        platform,
        positiveTags: find(unitEntities, tagRule, true),
        negativeTags: find(unitEntities, tagRule, false),
        positiveKeywords: find(unitEntities, kwRule, true),
        negativeKeywords: find(unitEntities, kwRule, false),
        positiveWps: find(unitEntities, wpRule, true),
        negativeWps: find(unitEntities, wpRule, false),
      };
    });
  }

  async createSoopCriterion(append: SoopCriterionAppend): Promise<SoopCriterionRecord> {
    const platform = await this.pfFinder.findByIdNotNull(append.platformId);
    const { cateRule } = await this.ruleFinder.findSoopRules();

    return db.transaction(async (tx) => {
      const criterion = await this.criterionRepo.create(append, tx);
      const promises: Promise<CriterionUnitEnt>[] = [];
      for (const cateNo of append.positiveCates) {
        promises.push(this.unitRepo.create(unitAppend(criterion, cateRule, cateNo, true), tx));
      }
      for (const cateNo of append.negativeCates) {
        promises.push(this.unitRepo.create(unitAppend(criterion, cateRule, cateNo, false), tx));
      }
      const unitEntities = await Promise.all(promises);
      return {
        ...criterion,
        platform,
        positiveCates: find(unitEntities, cateRule, true),
        negativeCates: find(unitEntities, cateRule, false),
      };
    });
  }
}

function unitAppend(
  criterion: CriterionEnt,
  rule: CriterionRuleEnt,
  value: string,
  positive: boolean,
): CriterionUnitEntAppend {
  return {
    criterionId: criterion.id,
    ruleId: rule.id,
    value,
    positive,
  };
}

function find(unitEntities: CriterionUnitEnt[], rule: CriterionRuleEnt, positive: boolean): string[] {
  if (positive) {
    return unitEntities.filter((it) => it.ruleId === rule.id && it.positive).map((it) => it.value);
  } else {
    return unitEntities.filter((it) => it.ruleId === rule.id && !it.positive).map((it) => it.value);
  }
}
