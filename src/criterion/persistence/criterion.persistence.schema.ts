import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { criterionRuleType } from '../business/criterion.rule.schema.js';

export const criterionEnt = z.object({
  id: uuid,
  name: z.string().max(50),
  description: z.string().nullable(),
  platformId: uuid,
  enforceCreds: z.boolean(),
  minUserCnt: z.number().int().nonnegative(),
  minFollowCnt: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type CriterionEnt = z.infer<typeof criterionEnt>;

export const criterionEntAppend = criterionEnt.partial({
  id: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});
export type CriterionEntAppend = z.infer<typeof criterionEntAppend>;

export const criterionRuleEnt = z.object({
  id: uuid,
  name: z.string().max(50),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type CriterionRuleEnt = z.infer<typeof criterionRuleEnt>;

export const criterionRuleEntAppend = criterionRuleEnt
  .partial({ id: true, createdAt: true, updatedAt: true })
  .extend({ name: criterionRuleType });
export type CriterionRuleEntAppend = z.infer<typeof criterionRuleEntAppend>;

export const criterionUnitEnt = z.object({
  id: uuid,
  criterionId: uuid,
  ruleId: uuid,
  value: z.string().nonempty(),
  positive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type CriterionUnitEnt = z.infer<typeof criterionUnitEnt>;

export const criterionUnitEntAppend = criterionUnitEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CriterionUnitEntAppend = z.infer<typeof criterionUnitEntAppend>;
