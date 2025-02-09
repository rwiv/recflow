import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const liveEnt = z.object({
  id: uuid,
  channelId: uuid,
  platformId: uuid,
  nodeId: uuid,
  liveTitle: z.string().min(1),
  viewCnt: z.number().int().nonnegative(),
  adult: z.boolean(),
  raw: z.string().min(1),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type LiveEnt = z.infer<typeof liveEnt>;

export const liveEntAppend = liveEnt.omit({
  id: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
});
export type LiveEntAppend = z.infer<typeof liveEntAppend>;

const liveEntUpdateForm = liveEnt.omit({ id: true }).partial();
export const liveEntUpdate = z.object({
  id: uuid,
  form: liveEntUpdateForm,
});
export type LiveEntUpdate = z.infer<typeof liveEntUpdate>;
