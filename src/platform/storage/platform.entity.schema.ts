import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const platformEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type PlatformEnt = z.infer<typeof platformEnt>;
