import { z } from 'zod';

export const platformType = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformType = z.infer<typeof platformType>;
