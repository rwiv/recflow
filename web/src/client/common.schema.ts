import { z } from 'zod';

export const platformNameEnum = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformName = z.infer<typeof platformNameEnum>;

export const platformDto = z.object({
  id: z.string().length(32),
  name: platformNameEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type PlatformDto = z.infer<typeof platformDto>;

export const channelSortTypeEnum = z.enum(['createdAt', 'updatedAt', 'followerCnt']);
export type ChannelSortType = z.infer<typeof channelSortTypeEnum>;

export const exitCmdEnum = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmdEnum>;
