import { z } from 'zod';

import { uuid } from '@/common/data/common.schema.js';

export const tagEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type TagEnt = z.infer<typeof tagEnt>;

export const tagEntAppend = tagEnt.omit({ createdAt: true, updatedAt: true }).partial({ id: true, description: true });
export type TagEntAppend = z.infer<typeof tagEntAppend>;

export const tagEntUpdate = tagEnt.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type TagEntUpdate = z.infer<typeof tagEntUpdate>;

export const channelsToTagsEnt = z.object({
  channelId: uuid,
  tagId: uuid,
  createdAt: z.coerce.date(),
});
export type ChannelsToTagsEnt = z.infer<typeof channelsToTagsEnt>;
export const channelsToTagsEntAppend = channelsToTagsEnt.omit({ createdAt: true });
export type ChannelsToTagsEntAppend = z.infer<typeof channelsToTagsEntAppend>;
