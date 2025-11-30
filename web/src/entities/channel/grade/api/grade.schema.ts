import { z } from 'zod';
import { uuid } from '@/shared/lib/schema/schema_common.ts';

export const gradeDto = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  tier: z.number().int().nonnegative(),
  seq: z.number().int().nonnegative(),
  shouldSave: z.boolean(),
  shouldNotify: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type GradeDto = z.infer<typeof gradeDto>;

export const gradeAppend = gradeDto.partial({
  id: true,
  description: true,
  shouldNotify: true,
  createdAt: true,
  updatedAt: true,
});
export type GradeAppend = z.infer<typeof gradeAppend>;

export const gradeUpdate = gradeDto.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type GradeUpdate = z.infer<typeof gradeUpdate>;
