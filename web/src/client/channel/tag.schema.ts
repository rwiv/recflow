import { z } from 'zod';
import { uuid } from '../../../../src/common/data/common.schema.ts';

export const tagDto = z.object({
  id: uuid,
  name: z.string().nonempty(),
  description: z.string().nonempty().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});
export type TagDto = z.infer<typeof tagDto>;

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

export const tagUpdate = tagDto.omit({ id: true, createdAt: true, updatedAt: true }).partial();
export type TagUpdate = z.infer<typeof tagUpdate>;
