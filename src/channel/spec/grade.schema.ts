import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const gradeEnt = z.object({
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
export type GradeEnt = z.infer<typeof gradeEnt>;

export const gradeEntAppend = gradeEnt.partial({
  id: true,
  description: true,
  shouldNotify: true,
  createdAt: true,
  updatedAt: true,
});
export type GradeEntAppend = z.infer<typeof gradeEntAppend>;

export const gradeEntUpdate = gradeEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type GradeEntUpdate = z.infer<typeof gradeEntUpdate>;

export const gradeDto = gradeEnt;
export type GradeDto = GradeEnt;

export const gradeAppend = gradeEntAppend;
export type GradeAppend = z.infer<typeof gradeAppend>;

export const gradeUpdate = gradeEntUpdate;
export type GradeUpdate = z.infer<typeof gradeUpdate>;
