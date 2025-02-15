import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const liveEnt = z.object({
  id: uuid,
  channelId: uuid,
  platformId: uuid,
  nodeId: uuid,
  liveTitle: z.string().min(1),
  viewCnt: z.number().int().nonnegative(),
  isAdult: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});
export type LiveEnt = z.infer<typeof liveEnt>;

export const liveEntAppend = liveEnt.partial({
  id: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type LiveEntAppend = z.infer<typeof liveEntAppend>;

const liveEntUpdateForm = liveEnt.omit({ id: true }).partial();
export const liveEntUpdate = z.object({
  id: uuid,
  form: liveEntUpdateForm,
});
export type LiveEntUpdate = z.infer<typeof liveEntUpdate>;
