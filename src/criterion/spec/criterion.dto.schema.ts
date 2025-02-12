import { z } from 'zod';
import { criterionEnt } from '../storage/criterion.entity.schema.js';
import { nonempty, uuid } from '../../common/data/common.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const criterionDto = criterionEnt.omit({ platformId: true }).extend({
  platform: platformDto,
});
export type CriterionDto = z.infer<typeof criterionDto>;

export const chzzkCriterionDto = criterionDto.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveWps: z.array(nonempty),
  negativeWps: z.array(nonempty),
});
export type ChzzkCriterionDto = z.infer<typeof chzzkCriterionDto>;

export const chzzkCriterionAppend = chzzkCriterionDto
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });
export type ChzzkCriterionAppend = z.infer<typeof chzzkCriterionAppend>;

export const soopCriterionDto = criterionDto.extend({
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
export type SoopCriterionDto = z.infer<typeof soopCriterionDto>;

export const soopCriterionAppend = soopCriterionDto
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });
export type SoopCriterionAppend = z.infer<typeof soopCriterionAppend>;
