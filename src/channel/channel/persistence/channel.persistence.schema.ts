import { z } from 'zod';
import { uuid } from '../../../common/data/common.schema.js';

export const channelEnt = z.object({
  id: uuid,
  platformId: uuid,
  pid: z.string().nonempty(),
  username: z.string().nonempty(),
  profileImgUrl: z.string().nullable(),
  followerCnt: z.number().nonnegative(),
  priorityId: uuid,
  followed: z.boolean(),
  description: z.string().nonempty().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ChannelEnt = z.infer<typeof channelEnt>;

export const chEntAppend = channelEnt
  .omit({ id: true })
  .partial({ profileImgUrl: true, description: true, createdAt: true, updatedAt: true });
export type ChannelEntAppend = z.infer<typeof chEntAppend>;

export const chEntUpdateForm = channelEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();
const chEntUpdate = z.object({
  id: z.string(),
  form: chEntUpdateForm,
});
export type ChannelEntUpdate = z.infer<typeof chEntUpdate>;

const pageEntResult = z.object({
  total: z.number().nonnegative(),
  channels: z.array(channelEnt),
});
export type PageEntResult = z.infer<typeof pageEntResult>;
