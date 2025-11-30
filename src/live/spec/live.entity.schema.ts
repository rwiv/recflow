import { z } from 'zod';

import { nnint, nonempty, uuid } from '@/common/data/common.schema.js';

import { liveStatusEnum } from '@/infra/db/schema.js';

export const liveStatus = z.enum(liveStatusEnum);
export type LiveStatus = z.infer<typeof liveStatus>;

export const liveEnt = z.object({
  id: uuid,
  channelId: uuid,
  platformId: uuid,
  sourceId: nonempty,
  liveTitle: nonempty,
  liveDetails: nonempty.nullable(),
  liveStreamId: uuid.nullable(),
  fsName: nonempty,
  videoName: nonempty,
  viewCnt: nnint,
  isAdult: z.boolean(),
  status: liveStatus,
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
  status: true,
  isDisabled: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type LiveEntAppend = z.infer<typeof liveEntAppend>;

export const liveEntUpdate = liveEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type LiveEntUpdate = z.infer<typeof liveEntUpdate>;

export const liveStreamEnt = z.object({
  id: uuid,
  channelId: uuid,
  sourceId: nonempty,
  url: nonempty,
  params: nonempty.nullable(),
  headers: nonempty,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  checkedAt: z.coerce.date(),
});
export type LiveStreamEnt = z.infer<typeof liveStreamEnt>;

export const liveStreamEntAppend = liveStreamEnt.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  checkedAt: true,
});
export type LiveStreamEntAppend = z.infer<typeof liveStreamEntAppend>;

export const liveStreamEntUpdate = liveStreamEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type LiveStreamEntUpdate = z.infer<typeof liveStreamEntUpdate>;
