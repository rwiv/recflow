import { z } from 'zod';

export const channelSortTypeEnum = z.enum(['createdAt', 'updatedAt', 'followerCnt']);
export type ChannelSortType = z.infer<typeof channelSortTypeEnum>;

export const exitCmdEnum = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmdEnum>;
