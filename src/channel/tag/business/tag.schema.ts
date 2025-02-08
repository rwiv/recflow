import { z } from 'zod';
import { tagEnt, TagEnt } from '../persistence/tag.schema.js';
import { uuid } from '../../../common/data/schema.js';

export const tagRecord = tagEnt;

export type TagRecord = TagEnt;

export const tagAttachment = z.object({
  channelId: uuid,
  tagName: z.string(),
});

export type TagAttachment = z.infer<typeof tagAttachment>;

export const tagDetachment = z.object({
  channelId: uuid,
  tagId: uuid,
});

export type TagDetachment = z.infer<typeof tagDetachment>;
