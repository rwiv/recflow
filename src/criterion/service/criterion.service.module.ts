import { Module } from '@nestjs/common';

import { PlatformModule } from '@/platform/platform.module.js';

import { CriterionFinder } from '@/criterion/service/criterion.finder.js';
import { CriterionMapper } from '@/criterion/service/criterion.mapper.js';
import { CriterionRuleFinder } from '@/criterion/service/criterion.rule.finder.js';
import { CriterionWriter } from '@/criterion/service/criterion.writer.js';
import { CriterionStorageModule } from '@/criterion/storage/criterion.storage.module.js';

@Module({
  imports: [CriterionStorageModule, PlatformModule],
  providers: [CriterionRuleFinder, CriterionMapper, CriterionWriter, CriterionFinder],
  exports: [CriterionWriter, CriterionFinder],
})
export class CriterionServiceModule {}
