import { z } from 'zod';
import { uuid } from '../../../common/data/common.schema.js';

export const chPriorityEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  tier: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
// export interface ChannelPriorityEnt {
//   id: string;
//   name: string;
//   tier: number;
//   createdAt: Date;
//   updatedAt: Date | null;
// }
export type ChannelPriorityEnt = z.infer<typeof chPriorityEnt>;
