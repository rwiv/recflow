import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { z } from 'zod';

import { nonempty } from '@/common/data/common.schema.js';

import { PlatformFinder } from '@/platform/storage/platform.finder.js';

import { CriterionWriter } from '@/criterion/service/criterion.writer.js';
import {
  ChzzkCriterionAppend,
  SoopCriterionAppend,
  chzzkCriterionAppend,
} from '@/criterion/spec/criterion.dto.schema.js';

const criterionBatchInsert = z.object({
  name: nonempty,
  enforceCreds: z.boolean(),
  minUserCnt: z.number().int().nonnegative(),
});
const chzzkCriterionBatchInsert = criterionBatchInsert.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveWps: z.array(nonempty),
  negativeWps: z.array(nonempty),
});
export type ChzzkCriterionBatchInsert = z.infer<typeof chzzkCriterionBatchInsert>;
const soopCriterionBatchInsert = criterionBatchInsert.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
export type SoopCriterionBatchInsert = z.infer<typeof soopCriterionBatchInsert>;
const criteriaBatchInsert = z.object({
  chzzk: z.array(chzzkCriterionBatchInsert),
  soop: z.array(soopCriterionBatchInsert),
});
export type CriteriaBatchInsert = z.infer<typeof criteriaBatchInsert>;

@Injectable()
export class DevCriterionInserter {
  constructor(
    private readonly criterionWriter: CriterionWriter,
    private readonly pfFinder: PlatformFinder,
  ) {}

  async insert(req: CriteriaBatchInsert) {
    const chzzkPlatform = await this.pfFinder.findByNameNotNull('chzzk');
    const soopPlatform = await this.pfFinder.findByNameNotNull('soop');
    for (const chzzk of req.chzzk) {
      const append: ChzzkCriterionAppend = {
        ...chzzk,
        platformId: chzzkPlatform.id,
        adultOnly: false,
        domesticOnly: false,
        overseasFirst: false,
        loggingOnly: false,
      };
      const parsed = chzzkCriterionAppend.parse(append);
      // parsed.isDeactivated = false;
      const created = await this.criterionWriter.createChzzkCriterion(parsed);
      log.info(`Inserted criterion: ${created.name}`);
    }
    for (const soop of req.soop) {
      const append: SoopCriterionAppend = {
        ...soop,
        platformId: soopPlatform.id,
        adultOnly: false,
        domesticOnly: false,
        overseasFirst: false,
        loggingOnly: false,
      };
      const created = await this.criterionWriter.createSoopCriterion(append);
      log.info(`Inserted criterion: ${created.name}`);
    }
  }
}
