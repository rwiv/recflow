import { z } from 'zod';

export const platformEnum = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformType = z.infer<typeof platformEnum>;

export const platformRecord = z.object({
  id: z.string().length(32),
  name: platformEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type PlatformRecord = z.infer<typeof platformRecord>;

export const channelSortEnum = z.enum(['createdAt', 'updatedAt', 'followerCnt']);
export type ChannelSortType = z.infer<typeof channelSortEnum>;

export const exitCmd = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmd>;
