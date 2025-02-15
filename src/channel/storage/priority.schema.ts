import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const priorityEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  tier: z.number().int().positive(),
  shouldNotify: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
// export interface PriorityEnt {
//   id: string;
//   name: string;
//   tier: number;
//   createdAt: Date;
//   updatedAt: Date | null;
// }
export type PriorityEnt = z.infer<typeof priorityEnt>;

export const priorityEntAppend = priorityEnt.partial({
  id: true,
  description: true,
  shouldNotify: true,
  createdAt: true,
  updatedAt: true,
});
export type PriorityEntAppend = z.infer<typeof priorityEntAppend>;
