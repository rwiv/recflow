import { Module } from '@nestjs/common';
import { CriterionStorageModule } from '../storage/criterion.storage.module.js';
import { CriterionWriter } from './criterion.writer.js';
import { CriterionFinder } from './criterion.finder.js';
import { CriterionMapper } from './criterion.mapper.js';
import { PlatformModule } from '../../platform/platform.module.js';
import { CriterionRuleFinder } from './criterion.rule.finder.js';

@Module({
  imports: [CriterionStorageModule, PlatformModule],
  providers: [CriterionRuleFinder, CriterionMapper, CriterionWriter, CriterionFinder],
  exports: [CriterionWriter, CriterionFinder],
})
export class CriterionServiceModule {}
