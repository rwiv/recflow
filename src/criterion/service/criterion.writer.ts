import { Injectable } from '@nestjs/common';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { ValidationError } from '@/utils/errors/errors/ValidationError.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { CriterionRuleFinder } from '@/criterion/service/criterion.rule.finder.js';
import {
  ChzzkCriterionAppend,
  ChzzkCriterionDto,
  CriterionUnitDto,
  CriterionUpdate,
  SoopCriterionAppend,
  SoopCriterionDto,
} from '@/criterion/spec/criterion.dto.schema.js';
import {
  CriterionEnt,
  CriterionRuleEnt,
  CriterionUnitEnt,
  CriterionUnitEntAppend,
} from '@/criterion/spec/criterion.entity.schema.js';
import { CriterionUnitRepository } from '@/criterion/storage/criterion-unit.repository.js';
import { CriterionRepository } from '@/criterion/storage/criterion.repository.js';

@Injectable()
export class CriterionWriter {
  constructor(
    private readonly criterionRepo: CriterionRepository,
    private readonly unitRepo: CriterionUnitRepository,
    private readonly pfFinder: PlatformFinder,
    private readonly ruleFinder: CriterionRuleFinder,
  ) {}

  async createUnit(append: CriterionUnitEntAppend, tx: Tx = db) {
    await this.unitRepo.create(append, tx);
  }

  async deleteUnit(unitId: string, tx: Tx = db) {
    await this.unitRepo.delete(unitId, tx);
  }

  async createChzzkCriterion(append: ChzzkCriterionAppend): Promise<ChzzkCriterionDto> {
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
        tagRuleId: tagRule.id,
        keywordRuleId: kwRule.id,
        wpRuleId: wpRule.id,
        positiveTags: find(unitEntities, tagRule, true),
        negativeTags: find(unitEntities, tagRule, false),
        positiveKeywords: find(unitEntities, kwRule, true),
        negativeKeywords: find(unitEntities, kwRule, false),
        positiveWps: find(unitEntities, wpRule, true),
        negativeWps: find(unitEntities, wpRule, false),
      };
    });
  }

  async createSoopCriterion(append: SoopCriterionAppend): Promise<SoopCriterionDto> {
    const platform = await this.pfFinder.findByIdNotNull(append.platformId);
    const { tagRule, keywordRule: kwRule, cateRule } = await this.ruleFinder.findSoopRules();

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
      for (const cateNo of append.positiveCates) {
        promises.push(this.unitRepo.create(unitAppend(ent, cateRule, cateNo, true), tx));
      }
      for (const cateNo of append.negativeCates) {
        promises.push(this.unitRepo.create(unitAppend(ent, cateRule, cateNo, false), tx));
      }
      const unitEntities = await Promise.all(promises);
      return {
        ...ent,
        platform,
        tagRuleId: tagRule.id,
        keywordRuleId: kwRule.id,
        cateRuleId: cateRule.id,
        positiveTags: find(unitEntities, tagRule, true),
        negativeTags: find(unitEntities, tagRule, false),
        positiveKeywords: find(unitEntities, kwRule, true),
        negativeKeywords: find(unitEntities, kwRule, false),
        positiveCates: find(unitEntities, cateRule, true),
        negativeCates: find(unitEntities, cateRule, false),
      };
    });
  }

  async updateDomestically(id: string, req: CriterionUpdate) {
    if (req.domesticOnly !== undefined && req.overseasFirst !== undefined) {
      throw new ValidationError('Cannot set domesticOnly when overseasFirst is true');
    }

    const ent = await this.criterionRepo.findById(id);
    if (!ent) {
      throw NotFoundError.from('Criterion', 'id', id);
    }

    if (req.domesticOnly !== undefined && ent.overseasFirst === true) {
      throw new ValidationError('Cannot set domesticOnly when overseasFirst is true');
    }
    if (req.overseasFirst !== undefined && ent.domesticOnly === true) {
      throw new ValidationError('Cannot set overseasFirst when domesticOnly is true');
    }

    await this.criterionRepo.update(id, req);
  }

  async update(id: string, req: CriterionUpdate) {
    if (req.domesticOnly !== undefined || req.overseasFirst !== undefined) {
      return this.updateDomestically(id, req);
    } else {
      return this.criterionRepo.update(id, req);
    }
  }

  async delete(criterionId: string) {
    const ent = await this.criterionRepo.findById(criterionId);
    if (!ent) throw NotFoundError.from('Criterion', 'id', criterionId);
    const units = await this.unitRepo.findByCriterionId(ent.id);
    return db.transaction(async (tx) => {
      await Promise.all(units.map((unit) => this.unitRepo.delete(unit.id, tx)));
      return this.criterionRepo.delete(criterionId, tx);
    });
  }
}

function unitAppend(
  criterion: CriterionEnt,
  rule: CriterionRuleEnt,
  value: string,
  isPositive: boolean,
): CriterionUnitEntAppend {
  return { criterionId: criterion.id, ruleId: rule.id, value, isPositive };
}

function find(unitEntities: CriterionUnitEnt[], rule: CriterionRuleEnt, positive: boolean): CriterionUnitDto[] {
  if (positive) {
    return unitEntities.filter((it) => it.ruleId === rule.id && it.isPositive);
  } else {
    return unitEntities.filter((it) => it.ruleId === rule.id && !it.isPositive);
  }
}
