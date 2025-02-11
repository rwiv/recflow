import { Module } from '@nestjs/common';
import { CriterionRepository } from '../persistence/criterion.repository.js';
import { CriterionWriter } from './criterion.writer.js';
import { CriterionFinder } from './criterion.finder.js';
import { CriterionMapper } from './criterion.mapper.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { CriterionRuleService } from './criterion.rule.js';

@Module({
  imports: [CriterionRepository, PlatformModule],
  providers: [CriterionRuleService, CriterionMapper, CriterionWriter, CriterionFinder],
  exports: [CriterionMapper, CriterionWriter, CriterionFinder],
})
export class CriterionBusinessModule {}
