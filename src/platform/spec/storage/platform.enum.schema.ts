import { z } from 'zod';

export const platformNameEnum = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformName = z.infer<typeof platformNameEnum>;
