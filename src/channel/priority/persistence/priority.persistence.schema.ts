import { z } from 'zod';
import { uuid } from '../../../common/data/common.schema.js';

export const chPriorityEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  tier: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type ChannelPriorityEnt = z.infer<typeof chPriorityEnt>;
