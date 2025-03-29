import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';

export const channelEnt = z.object({
  id: uuid,
  platformId: uuid,
  pid: z.string().nonempty(),
  username: z.string().nonempty(),
  profileImgUrl: z.string().nullable(),
  followerCnt: z.number().nonnegative(),
  priorityId: uuid,
  isFollowed: z.boolean(),
  overseasFirst: z.boolean(),
  adultOnly: z.boolean(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastRefreshedAt: z.coerce.date().nullable(),
});
export type ChannelEnt = z.infer<typeof channelEnt>;

export const channelEntAppend = channelEnt.partial({
  id: true,
  profileImgUrl: true,
  description: true,
  overseasFirst: true,
  adultOnly: true,
  createdAt: true,
  updatedAt: true,
  lastRefreshedAt: true,
});
export type ChannelEntAppend = z.infer<typeof channelEntAppend>;

export const channelEntUpdate = channelEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type ChannelEntUpdate = z.infer<typeof channelEntUpdate>;

export const channelPageEntResult = z.object({
  total: z.number().nonnegative(),
  channels: z.array(channelEnt),
});
export type ChannelPageEntResult = z.infer<typeof channelPageEntResult>;
