import { z } from 'zod';
import { tagRecord } from './tag.schema.js';
import { channelEnt } from '../persistence/channel.schema.js';
import { platformType, uuid } from '../../common/schema.js';

export const channelRecord = channelEnt
  .omit({ platformId: true, priorityId: true })
  .extend({
    platformName: platformType,
    priorityName: z.string().nonempty(),
    tags: z.array(tagRecord),
  })
  .partial({ tags: true });

export type ChannelRecord = z.infer<typeof channelRecord>;

export const channelAppend = channelRecord
  .omit({ id: true })
  .partial({ profileImgUrl: true, description: true, createdAt: true, updatedAt: true });

export type ChannelAppend = z.infer<typeof channelAppend>;

export const channelAppendWithFetch = channelAppend
  .pick({
    pid: true,
    platformName: true,
    priorityName: true,
    followed: true,
    description: true,
  })
  .extend({ tagNames: z.array(z.string()) })
  .partial({ tagNames: true });

export type ChannelAppendWithFetch = z.infer<typeof channelAppendWithFetch>;

export const channelAppendWithInfo = channelAppendWithFetch.pick({
  priorityName: true,
  followed: true,
  description: true,
  tagNames: true,
});

export type ChannelAppendWithInfo = z.infer<typeof channelAppendWithInfo>;

export const channelUpdateForm = channelRecord
  .pick({
    priorityName: true,
    followed: true,
    description: true,
  })
  .partial();

export const channelUpdate = z.object({
  id: uuid,
  form: channelUpdateForm,
});

export type ChannelUpdate = z.infer<typeof channelUpdate>;

export const channelSortEnum = z.enum(['latest', 'followerCnt']);
export const channelSortArg = channelSortEnum.optional();
export type ChannelSortType = z.infer<typeof channelSortArg>;
