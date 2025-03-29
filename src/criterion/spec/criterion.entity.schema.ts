import { z } from 'zod';
import { nonempty, uuid } from '../../common/data/common.schema.js';
import { criterionRuleNameUnion } from './criterion.rule.schema.js';

export const criterionEnt = z.object({
  id: uuid,
  name: nonempty,
  description: nonempty.nullable(),
  platformId: uuid,
  enforceCreds: z.boolean(),
  isDeactivated: z.boolean(),
  domesticOnly: z.boolean(),
  overseasFirst: z.boolean(),
  adultOnly: z.boolean(),
  minUserCnt: z.number().int().nonnegative(),
  minFollowCnt: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type CriterionEnt = z.infer<typeof criterionEnt>;

// name, platform cannot be changed
export const criterionEntUpdate = criterionEnt
  .omit({ id: true, name: true, platformId: true, createdAt: true, updatedAt: true })
  .partial();
export type CriterionEntUpdate = z.infer<typeof criterionEntUpdate>;

export const criterionEntAppend = criterionEnt.partial({
  id: true,
  description: true,
  isDeactivated: true,
  domesticOnly: true,
  overseasFirst: true,
  adultOnly: true,
  createdAt: true,
  updatedAt: true,
});
export type CriterionEntAppend = z.infer<typeof criterionEntAppend>;

export const criterionRuleEnt = z.object({
  id: uuid,
  name: nonempty,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type CriterionRuleEnt = z.infer<typeof criterionRuleEnt>;

export const criterionRuleEntAppend = criterionRuleEnt
  .partial({ id: true, createdAt: true, updatedAt: true })
  .extend({ name: criterionRuleNameUnion });
export type CriterionRuleEntAppend = z.infer<typeof criterionRuleEntAppend>;

export const criterionUnitEnt = z.object({
  id: uuid,
  criterionId: uuid,
  ruleId: uuid,
  value: nonempty,
  isPositive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type CriterionUnitEnt = z.infer<typeof criterionUnitEnt>;

export const criterionUnitEntAppend = criterionUnitEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CriterionUnitEntAppend = z.infer<typeof criterionUnitEntAppend>;
