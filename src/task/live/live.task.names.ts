import { z } from 'zod';

export const liveTaskName = {
  LIVE_REGISTER_CRITERION: 'LIVE_REGISTER_CRITERION',
  LIVE_REGISTER_FOLLOWED: 'LIVE_REGISTER_FOLLOWED',
  LIVE_CLEANUP: 'LIVE_CLEANUP',
  LIVE_REFRESH: 'LIVE_REFRESH',
  LIVE_RECOVERY: 'LIVE_RECOVERY',
  LIVE_STATE_CLEANUP: 'LIVE_STATE_CLEANUP',
  LIVE_ALLOCATION: 'LIVE_ALLOCATION',
} as const;
export const liveTaskNameEnum = z.nativeEnum(liveTaskName);
export type LiveTaskName = z.infer<typeof liveTaskNameEnum>;
