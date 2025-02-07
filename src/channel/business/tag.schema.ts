import { z } from 'zod';
import { TagEnt } from '../persistence/tag.schema.js';
import { uuid } from '../../common/schema.js';

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
