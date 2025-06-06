import { z } from 'zod';
import { nonempty, uuid } from '@/common/common.schema.ts';
import { platformDto } from '@/client/common/platform.schema.ts';

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
  sufficientUserCnt: z.coerce.number().int().nonnegative(),
  minUserCnt: z.coerce.number().int().nonnegative(),
  minFollowCnt: z.coerce.number().int().nonnegative(),
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
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
export type SoopCriterionDto = z.infer<typeof soopCriterionDto>;

export const soopCriterionAppend = soopCriterionDto
  .partial({ id: true, description: true, createdAt: true, updatedAt: true })
  .omit({ platform: true })
  .extend({ platformId: uuid });
export type SoopCriterionAppend = z.infer<typeof soopCriterionAppend>;
