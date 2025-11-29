import { z } from 'zod';
import { uuid } from '@shared/lib/schema';

export const platformNameEnum = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformName = z.infer<typeof platformNameEnum>;

export const platformDto = z.object({
  id: uuid,
  name: platformNameEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});
export type PlatformDto = z.infer<typeof platformDto>;
