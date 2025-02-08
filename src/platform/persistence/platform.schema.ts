import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const platformEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type PlatformEnt = z.infer<typeof platformEnt>;
