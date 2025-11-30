import { z } from 'zod';

import { platformNameEnum } from '@/platform/spec/storage/platform.enum.schema.js';
import { platformEnt } from '@/platform/storage/platform.entity.schema.js';

export const platformDto = platformEnt.extend({
  name: platformNameEnum,
});
export type PlatformDto = z.infer<typeof platformDto>;
