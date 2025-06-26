import { Injectable } from '@nestjs/common';
import { CriterionRuleRepository } from '../../criterion/storage/criterion-rule.repository.js';
import { chzzkCriterionRuleNameEnum, soopCriterionRuleNameEnum } from '../../criterion/spec/criterion.rule.schema.js';

@Injectable()
export class ProdInitializer {
  constructor(private readonly ruleRepo: CriterionRuleRepository) {}

  async check() {
    for (const ruleName of chzzkCriterionRuleNameEnum.options) {
      if (!(await this.ruleRepo.findByName(ruleName))) {
        await this.ruleRepo.create({ name: ruleName });
      }
    }
    for (const ruleName of soopCriterionRuleNameEnum.options) {
      if (!(await this.ruleRepo.findByName(ruleName))) {
        await this.ruleRepo.create({ name: ruleName });
      }
    }
  }
}
