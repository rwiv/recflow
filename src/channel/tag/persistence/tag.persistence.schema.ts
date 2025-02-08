import { z } from 'zod';
import { uuid } from '../../../common/data/common.schema.js';

export const tagEnt = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});
export type TagEnt = z.infer<typeof tagEnt>;

const tagEntAppend = tagEnt
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial({ description: true });
export type TagEntAppend = z.infer<typeof tagEntAppend>;

export const tagEntUpdate = z.object({
  tagId: uuid,
  form: tagEntAppend.partial(),
});
export type TagEntUpdate = z.infer<typeof tagEntUpdate>;

export const channelsToTagsEnt = z.object({
  channelId: uuid,
  tagId: uuid,
  createdAt: z.date(),
});
export type ChannelsToTagsEnt = z.infer<typeof channelsToTagsEnt>;
