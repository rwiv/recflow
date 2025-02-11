import { z } from 'zod';
import { platformEnt } from './platform.persistence.schema.js';

export const platformType = z.enum(['chzzk', 'soop', 'twitch']);
export type PlatformType = z.infer<typeof platformType>;

export const platformRecord = platformEnt.extend({
  name: platformType,
});
// export interface PlatformRecord {
//   id: string;
//   name: PlatformType;
//   createdAt: Date;
//   updatedAt: Date | null;
// }
export type PlatformRecord = z.infer<typeof platformRecord>;
