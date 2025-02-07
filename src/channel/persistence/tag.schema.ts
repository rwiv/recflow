import { z } from 'zod';
import { uuid } from '../../common/schema.js';

export const tagEnt = z.object({
  id: uuid,
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type TagEnt = z.infer<typeof tagEnt>;

export const tagCreation = tagEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial({ description: true });

export type TagEntCreation = z.infer<typeof tagCreation>;

export const tagUpdate = z.object({
  tagId: uuid,
  form: tagCreation.partial(),
});

export type TagEntUpdate = z.infer<typeof tagUpdate>;

export const channelsToTagsEnt = z.object({
  channelId: uuid,
  tagId: uuid,
  createdAt: z.date(),
});

export type ChannelsToTagsEnt = z.infer<typeof channelsToTagsEnt>;
