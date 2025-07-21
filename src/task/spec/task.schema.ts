import { z } from 'zod';
import { nnint, nonempty } from '../../common/data/common.schema.js';

export const taskMeta = z.object({
  lock: nonempty.nullable(),
  delay: nnint.nullable(),
});
export type TaskMeta = z.infer<typeof taskMeta>;
