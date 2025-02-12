import { z } from 'zod';
import { criterionEnt } from '../storage/criterion.entity.schema.js';
import { nonempty, uuid } from '../../common/data/common.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const criterionRecord = criterionEnt.omit({ platformId: true }).extend({
  platform: platformDto,
});
export type CriterionRecord = z.infer<typeof criterionRecord>;

export const chzzkCriterionRecord = criterionRecord.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveWps: z.array(nonempty),
  negativeWps: z.array(nonempty),
});
export type ChzzkCriterionRecord = z.infer<typeof chzzkCriterionRecord>;

export const chzzkCriterionAppend = chzzkCriterionRecord
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });
export type ChzzkCriterionAppend = z.infer<typeof chzzkCriterionAppend>;

export const soopCriterionRecord = criterionRecord.extend({
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
export type SoopCriterionRecord = z.infer<typeof soopCriterionRecord>;

export const soopCriterionAppend = soopCriterionRecord
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });
export type SoopCriterionAppend = z.infer<typeof soopCriterionAppend>;
