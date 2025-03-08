import { z } from 'zod';

export const liveTaskName = {
  LIVE_REGISTER: 'LIVE_REGISTER',
  LIVE_CHECK_REGISTER: 'LIVE_CHECK_REGISTER',
  LIVE_CLEANUP: 'LIVE_CLEANUP',
  LIVE_REFRESH: 'LIVE_REFRESH',
  LIVE_RECOVERY: 'LIVE_RECOVERY',
} as const;
export const liveTaskNameEnum = z.nativeEnum(liveTaskName);
export type LiveTaskName = z.infer<typeof liveTaskNameEnum>;
