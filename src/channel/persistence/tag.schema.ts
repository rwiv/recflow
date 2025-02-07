import { z } from 'zod';
import { uuid } from '../../common/schema.js';

export const tagEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type TagEnt = z.infer<typeof tagEnt>;

export const tagEntCreation = tagEnt.partial({ description: true, updatedAt: true });

export type TagEntCreation = z.infer<typeof tagEntCreation>;

export const tagAppend = tagEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial({ description: true });

export type TagEntAppend = z.infer<typeof tagAppend>;

export const tagUpdate = z.object({
  tagId: uuid,
  form: tagAppend.partial(),
});

export type TagEntUpdate = z.infer<typeof tagUpdate>;

export const channelsToTagsEnt = z.object({
  channelId: uuid,
  tagId: uuid,
  createdAt: z.date(),
});

export type ChannelsToTagsEnt = z.infer<typeof channelsToTagsEnt>;
