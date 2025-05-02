import { z } from 'zod';
import { nnint, nonempty, uuid } from '../../common/data/common.schema.js';

export const liveEnt = z.object({
  id: uuid,
  channelId: uuid,
  platformId: uuid,
  sourceId: nonempty,
  liveTitle: nonempty,
  streamUrl: nonempty.nullable(),
  headers: nonempty.nullable(),
  fsName: nonempty,
  videoName: nonempty,
  viewCnt: nnint,
  isAdult: z.boolean(),
  isDisabled: z.boolean(),
  domesticOnly: z.boolean(),
  overseasFirst: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});
export type LiveEnt = z.infer<typeof liveEnt>;

export const liveEntAppend = liveEnt.partial({
  id: true,
  isDisabled: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type LiveEntAppend = z.infer<typeof liveEntAppend>;

export const liveEntUpdate = liveEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type LiveEntUpdate = z.infer<typeof liveEntUpdate>;
