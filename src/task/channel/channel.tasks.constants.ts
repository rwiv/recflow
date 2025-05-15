import { z } from 'zod';

export const DEFAULT_CHANNEL_REFRESH_CYCLE = 2 * 1000;
export const DEFAULT_CHANNEL_CACHE_CHECK_CYCLE = 30 * 60 * 1000;

export const channelTaskName = {
  CHANNEL_REFRESH: 'CHANNEL_REFRESH',
  CHANNEL_CACHE_CHECK: 'CHANNEL_CACHE_CHECK',
} as const;
export const channelTaskNameEnum = z.nativeEnum(channelTaskName);
export type ChannelTaskName = z.infer<typeof channelTaskNameEnum>;
