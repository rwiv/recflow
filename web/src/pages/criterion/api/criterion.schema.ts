import { z } from 'zod';
import { nonempty, uuid } from '@/shared/lib/schema/schema_common.ts';
import { platformDto } from '@/entities/platform/model/platform.schema.ts';

export const criterionUnitDto = z.object({
  id: uuid,
  criterionId: uuid,
  ruleId: uuid,
  value: nonempty,
  isPositive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type CriterionUnitDto = z.infer<typeof criterionUnitDto>;

export const criterionDto = z.object({
  id: uuid,
  name: nonempty,
  description: nonempty.nullable(),
  platform: platformDto,
  isDeactivated: z.boolean(),
  adultOnly: z.boolean(),
  enforceCreds: z.boolean(),
  domesticOnly: z.boolean(),
  overseasFirst: z.boolean(),
  loggingOnly: z.boolean(),
  minUserCnt: z.coerce.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type CriterionDto = z.infer<typeof criterionDto>;

// name, platform cannot be changed
export const criterionUpdate = criterionDto
  .omit({
    id: true,
    name: true,
    platform: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type CriterionUpdate = z.infer<typeof criterionUpdate>;

export const chzzkCriterionDto = criterionDto.extend({
  tagRuleId: uuid,
  keywordRuleId: uuid,
  wpRuleId: uuid,
  positiveTags: z.array(criterionUnitDto),
  negativeTags: z.array(criterionUnitDto),
  positiveKeywords: z.array(criterionUnitDto),
  negativeKeywords: z.array(criterionUnitDto),
  positiveWps: z.array(criterionUnitDto),
  negativeWps: z.array(criterionUnitDto),
});
export type ChzzkCriterionDto = z.infer<typeof chzzkCriterionDto>;

export const chzzkCriterionAppend = chzzkCriterionDto
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true, tagRuleId: true, keywordRuleId: true, wpRuleId: true })
  .extend({
    platformId: uuid,
    positiveTags: z.array(nonempty),
    negativeTags: z.array(nonempty),
    positiveKeywords: z.array(nonempty),
    negativeKeywords: z.array(nonempty),
    positiveWps: z.array(nonempty),
    negativeWps: z.array(nonempty),
  });
export type ChzzkCriterionAppend = z.infer<typeof chzzkCriterionAppend>;

export const soopCriterionDto = criterionDto.extend({
  tagRuleId: uuid,
  keywordRuleId: uuid,
  cateRuleId: uuid,
  positiveTags: z.array(criterionUnitDto),
  negativeTags: z.array(criterionUnitDto),
  positiveKeywords: z.array(criterionUnitDto),
  negativeKeywords: z.array(criterionUnitDto),
  positiveCates: z.array(criterionUnitDto),
  negativeCates: z.array(criterionUnitDto),
});
export type SoopCriterionDto = z.infer<typeof soopCriterionDto>;

export const soopCriterionAppend = soopCriterionDto
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true, tagRuleId: true, keywordRuleId: true, cateRuleId: true })
  .extend({
    platformId: uuid,
    positiveTags: z.array(nonempty),
    negativeTags: z.array(nonempty),
    positiveKeywords: z.array(nonempty),
    negativeKeywords: z.array(nonempty),
    positiveCates: z.array(nonempty),
    negativeCates: z.array(nonempty),
  });
export type SoopCriterionAppend = z.infer<typeof soopCriterionAppend>;

export const criterionUnitAppend = z.object({
  criterionId: nonempty,
  ruleId: nonempty,
  value: nonempty,
  isPositive: z.boolean(),
});
export type CriterionUnitAppend = z.infer<typeof criterionUnitAppend>;
