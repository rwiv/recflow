import { z } from 'zod';
import { tagDto } from './tag.dto.schema.js';
import { channelEnt, channelEntAppend, channelEntUpdate } from './channel.entity.schema.js';
import { PriorityEnt, priorityEnt, priorityEntAppend } from './priority.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const priorityDto = priorityEnt;
export type PriorityDto = PriorityEnt;

export const priorityAppend = priorityEntAppend;
export type PriorityAppend = z.infer<typeof priorityAppend>;

export const channelDto = channelEnt.omit({ platformId: true, priorityId: true }).extend({
  platform: platformDto,
  priority: priorityDto,
  tags: z.array(tagDto).optional(),
});
export type ChannelDto = z.infer<typeof channelDto>;

export const channelAppend = channelEntAppend;
export type ChannelAppend = z.infer<typeof channelAppend>;

export const channelAppendWithFetch = channelAppend
  .pick({
    pid: true,
    platformId: true,
    priorityId: true,
    isFollowed: true,
    description: true,
  })
  .extend({
    tagNames: z.array(z.string().nonempty()).optional(),
  });
export type ChannelAppendWithFetch = z.infer<typeof channelAppendWithFetch>;

export const channelAppendWithInfo = channelAppendWithFetch.omit({ pid: true, platformId: true });
export type ChannelAppendWithInfo = z.infer<typeof channelAppendWithInfo>;

export const channelUpdate = channelEntUpdate.extend({
  priorityName: z.string().nonempty().optional(),
});
export type ChannelUpdate = z.infer<typeof channelUpdate>;

export const channelSortTypeEnum = z.enum(['createdAt', 'updatedAt', 'followerCnt']);
export type ChannelSortType = z.infer<typeof channelSortTypeEnum>;

export const channelPageResult = z.object({
  total: z.number().nonnegative(),
  channels: z.array(channelDto),
});
export type ChannelPageResult = z.infer<typeof channelPageResult>;
