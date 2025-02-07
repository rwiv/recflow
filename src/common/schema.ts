import { z } from 'zod';

export const uuid = z.string().length(32);

export const platformType = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformType = z.infer<typeof platformType>;
