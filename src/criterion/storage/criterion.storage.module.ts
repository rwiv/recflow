import { Module } from '@nestjs/common';

import { CriterionRuleRepository } from '@/criterion/storage/criterion-rule.repository.js';
import { CriterionUnitRepository } from '@/criterion/storage/criterion-unit.repository.js';
import { CriterionRepository } from '@/criterion/storage/criterion.repository.js';

@Module({
  providers: [CriterionRepository, CriterionRuleRepository, CriterionUnitRepository],
  exports: [CriterionRepository, CriterionRuleRepository, CriterionUnitRepository],
})
export class CriterionStorageModule {}
