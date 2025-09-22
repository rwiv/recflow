import { z } from 'zod';
import { criterionEnt, criterionEntUpdate, criterionUnitEnt } from './criterion.entity.schema.js';
import { nonempty, uuid } from '../../common/data/common.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const criterionUnitDto = criterionUnitEnt;
export type CriterionUnitDto = z.infer<typeof criterionUnitDto>;

export const criterionDto = criterionEnt.omit({ platformId: true }).extend({
  platform: platformDto,
});
export type CriterionDto = z.infer<typeof criterionDto>;

export const criterionUpdate = criterionEntUpdate;
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
  .partial({
    id: true,
    description: true,
    isDeactivated: true,
    createdAt: true,
    updatedAt: true,
  })
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
  .partial({
    id: true,
    description: true,
    isDeactivated: true,
    createdAt: true,
    updatedAt: true,
  })
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

export type PlatformCriterionDto = ChzzkCriterionDto | SoopCriterionDto;
