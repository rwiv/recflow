import { z } from 'zod';
import { tagEnt, TagEnt } from './tag.entity.schema.js';
import { uuid } from '../../common/data/common.schema.js';

export const tagDto = tagEnt;
export type TagDto = TagEnt;

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
