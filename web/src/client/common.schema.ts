import { z } from 'zod';

export const platformTypeEnum = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformType = z.infer<typeof platformTypeEnum>;

export const platformRecord = z.object({
  id: z.string().length(32),
  name: platformTypeEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type PlatformRecord = z.infer<typeof platformRecord>;
