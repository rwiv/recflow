import { platformEnt } from '../../storage/platform.entity.schema.js';
import { z } from 'zod';
import { platformNameEnum } from './platform.enum.schema.js';

export const platformDto = platformEnt.extend({
  name: platformNameEnum,
});
export type PlatformDto = z.infer<typeof platformDto>;
