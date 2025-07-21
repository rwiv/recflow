import { z } from 'zod';
import { nnint, nonempty } from '../../common/data/common.schema.js';

export const lockSchema = z.object({ name: nonempty, token: nonempty });
export type LockSchema = z.infer<typeof lockSchema>;

export const taskMeta = z.object({
  lock: lockSchema.nullable(),
  delay: nnint.nullable(),
});
export type TaskMeta = z.infer<typeof taskMeta>;
