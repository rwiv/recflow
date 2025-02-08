import { z } from 'zod';

export const platformTypeEnum = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformType = z.infer<typeof platformTypeEnum>;
