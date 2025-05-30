import { z } from 'zod';
import { nnint, nonempty } from '@/common/common.schema.ts';

export const taskInfo = z.object({
  name: nonempty,
  delayMs: nnint,
  status: nonempty,
  promise: nonempty,
  executionCnt: nnint,
});
export type TaskInfo = z.infer<typeof taskInfo>;
