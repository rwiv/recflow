import { z } from 'zod';

export const batchTaskNameEnum = z.enum(['channel_refresh']);
export type BatchTaskName = z.infer<typeof batchTaskNameEnum>;
