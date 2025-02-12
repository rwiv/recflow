import { z } from 'zod';

export const liveTaskNameEnum = z.enum(['LIVE_REGISTER', 'LIVE_CLEANUP', 'LIVE_REFRESH']);
export type LiveTaskName = z.infer<typeof liveTaskNameEnum>;
