import { Module } from '@nestjs/common';
import { CriterionRepository } from './criterion.repository.js';
import { CriterionRuleRepository } from './criterion-rule.repository.js';
import { CriterionUnitRepository } from './criterion-unit.repository.js';

@Module({
  providers: [CriterionRepository, CriterionRuleRepository, CriterionUnitRepository],
  exports: [CriterionRepository, CriterionRuleRepository, CriterionUnitRepository],
})
export class CriterionStorageModule {}
