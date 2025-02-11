import { Module } from '@nestjs/common';
import { CriterionPersistenceModule } from '../persistence/criterion.persistence.module.js';
import { CriterionWriter } from './criterion.writer.js';
import { CriterionFinder } from './criterion.finder.js';
import { CriterionMapper } from './criterion.mapper.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { CriterionRuleService } from './criterion.rule.js';

@Module({
  imports: [CriterionPersistenceModule, PlatformModule],
  providers: [CriterionRuleService, CriterionMapper, CriterionWriter, CriterionFinder],
  exports: [CriterionWriter, CriterionFinder],
})
export class CriterionBusinessModule {}
