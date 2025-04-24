import { z } from 'zod';
import { uuid } from '@/common/common.schema.ts';

export const priorityDto = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  seq: z.number().int().nonnegative(),
  shouldSave: z.boolean(),
  shouldNotify: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type PriorityDto = z.infer<typeof priorityDto>;

export const priorityAppend = priorityDto.partial({
  id: true,
  description: true,
  shouldNotify: true,
  createdAt: true,
  updatedAt: true,
});
export type PriorityAppend = z.infer<typeof priorityAppend>;

export const priorityUpdate = priorityDto.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type PriorityUpdate = z.infer<typeof priorityUpdate>;
