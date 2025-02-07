import { z } from 'zod';
import { uuid } from '../../common/schema.js';

export const channelEnt = z.object({
  id: uuid,
  platformId: uuid,
  pid: z.string(),
  username: z.string(),
  profileImgUrl: z.string().nullable(),
  followerCnt: z.number(),
  priorityId: uuid,
  followed: z.boolean(),
  description: z.string().nonempty().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ChannelEnt = z.infer<typeof channelEnt>;

export const channelEntCreation = channelEnt.partial({ profileImgUrl: true, description: true });

export type ChannelEntCreation = z.infer<typeof channelEntCreation>;

export const channelEntAppend = channelEnt
  .omit({ id: true })
  .partial({ profileImgUrl: true, description: true, createdAt: true, updatedAt: true });

export type ChannelEntAppend = z.infer<typeof channelEntAppend>;

export const channelEntUpdateForm = channelEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();

export const channelEntUpdate = z.object({
  id: z.string(),
  form: channelEntUpdateForm,
});

export type ChannelEntUpdate = z.infer<typeof channelEntUpdate>;
