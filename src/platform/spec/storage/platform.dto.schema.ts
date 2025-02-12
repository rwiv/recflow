import { platformEnt } from '../../storage/platform.entity.schema.js';
import { z } from 'zod';
import { platformNameEnum } from './platform.enum.schema.js';

export const platformDto = platformEnt.extend({
  name: platformNameEnum,
});
// export interface PlatformRecord {
//   id: string;
//   name: PlatformType;
//   createdAt: Date;
//   updatedAt: Date | null;
// }
export type PlatformDto = z.infer<typeof platformDto>;
