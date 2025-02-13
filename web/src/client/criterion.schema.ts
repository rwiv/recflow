import { z } from 'zod';
import { nonempty, uuid } from '@/common/common.schema';
import { platformDto } from '@/client/common.schema.ts';

export const criterionDto = z.object({
  id: uuid,
  name: nonempty,
  description: nonempty.nullable(),
  platform: platformDto,
  enforceCreds: z.boolean(),
  minUserCnt: z.number().int().nonnegative(),
  minFollowCnt: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export const chzzkCriterionDto = criterionDto.extend({
  positiveTags: z.array(nonempty),
  negativeTags: z.array(nonempty),
  positiveKeywords: z.array(nonempty),
  negativeKeywords: z.array(nonempty),
  positiveWps: z.array(nonempty),
  negativeWps: z.array(nonempty),
});

export const soopCriterionDto = criterionDto.extend({
  positiveCates: z.array(nonempty),
  negativeCates: z.array(nonempty),
});
