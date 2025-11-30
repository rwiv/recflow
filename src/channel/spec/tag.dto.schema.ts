import { z } from 'zod';

import { uuid } from '@/common/data/common.schema.js';

import { TagEnt, tagEnt, tagEntAppend, tagEntUpdate } from '@/channel/spec/tag.entity.schema.js';

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

export const tagAppend = tagEntAppend;
export type TagAppend = z.infer<typeof tagAppend>;

export const tagUpdate = tagEntUpdate;
export type TagUpdate = z.infer<typeof tagUpdate>;
