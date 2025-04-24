import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const priorityEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  tier: z.number().int().positive(),
  seq: z.number().int().nonnegative(),
  shouldSave: z.boolean(),
  shouldNotify: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type PriorityEnt = z.infer<typeof priorityEnt>;

export const priorityEntAppend = priorityEnt.partial({
  id: true,
  description: true,
  shouldNotify: true,
  createdAt: true,
  updatedAt: true,
});
export type PriorityEntAppend = z.infer<typeof priorityEntAppend>;

export const priorityEntUpdate = priorityEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type PriorityEntUpdate = z.infer<typeof priorityEntUpdate>;

export const priorityDto = priorityEnt;
export type PriorityDto = PriorityEnt;

export const priorityAppend = priorityEntAppend;
export type PriorityAppend = z.infer<typeof priorityAppend>;

export const priorityUpdate = priorityEntUpdate;
export type PriorityUpdate = z.infer<typeof priorityUpdate>;
