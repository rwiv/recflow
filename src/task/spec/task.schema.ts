import { z } from 'zod';

import { nnint, nonempty } from '@/common/data/common.schema.js';

export const lockSchema = z.object({ name: nonempty, token: nonempty });
export type LockSchema = z.infer<typeof lockSchema>;

export const taskMeta = z.object({
  lock: lockSchema.optional(),
  delay: nnint.optional(),
});
export type TaskMeta = z.infer<typeof taskMeta>;

export const taskDef = z.object({
  delay: nnint.optional(),
  ex: nnint,
});
export type TaskDef = z.infer<typeof taskDef>;
