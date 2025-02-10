import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const liveCriterionEnt = z.object({
  id: uuid,
  name: z.string().max(50),
  description: z.string().nullable(),
  platformId: uuid,
  minUserCnt: z.number().int().nonnegative(),
  minFollowCnt: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type LiveCriterionEnt = z.infer<typeof liveCriterionEnt>;

export const liveCriterionEntAppend = liveCriterionEnt.partial({
  id: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});
export type LiveCriterionEntAppend = z.infer<typeof liveCriterionEntAppend>;

export const liveCriterionRuleEnt = z.object({
  id: uuid,
  name: z.string().max(50),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type LiveCriterionRuleEnt = z.infer<typeof liveCriterionRuleEnt>;

export const liveCriterionRuleEntAppend = liveCriterionRuleEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type LiveCriterionRuleEntAppend = z.infer<typeof liveCriterionRuleEntAppend>;

export const liveCriterionUnitEnt = z.object({
  id: uuid,
  criterionId: uuid,
  filterTypeId: uuid,
  value: z.string().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type LiveCriterionUnitEnt = z.infer<typeof liveCriterionUnitEnt>;

export const liveCriterionUnitEntAppend = liveCriterionUnitEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type LiveCriterionUnitEntAppend = z.infer<typeof liveCriterionUnitEntAppend>;
