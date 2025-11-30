import { z } from 'zod';

import { platformDto } from '@/platform/spec/storage/platform.dto.schema.js';

import { channelEnt, channelEntAppend, channelEntUpdate } from '@/channel/spec/channel.entity.schema.js';
import { gradeDto } from '@/channel/spec/grade.schema.js';
import { tagDto } from '@/channel/spec/tag.dto.schema.js';

export const channelDto = channelEnt.omit({ platformId: true, gradeId: true }).extend({
  platform: platformDto,
  grade: gradeDto,
});
export type ChannelDto = z.infer<typeof channelDto>;

export const mappedChannelDto = channelDto.extend({
  tags: z.array(tagDto).optional(),
});
export type MappedChannelDto = z.infer<typeof mappedChannelDto>;

export const channelAppend = channelEntAppend;
export type ChannelAppend = z.infer<typeof channelAppend>;

export const channelAppendWithFetch = channelAppend
  .pick({
    sourceId: true,
    platformId: true,
    gradeId: true,
    isFollowed: true,
    description: true,
  })
  .extend({
    tagNames: z.array(z.string().nonempty()).optional(),
  });
export type ChannelAppendWithFetch = z.infer<typeof channelAppendWithFetch>;

export const channelAppendWithInfo = channelAppendWithFetch.omit({ sourceId: true, platformId: true });
export type ChannelAppendWithInfo = z.infer<typeof channelAppendWithInfo>;

export const channelUpdate = channelEntUpdate.extend({
  gradeName: z.string().nonempty().optional(),
});
export type ChannelUpdate = z.infer<typeof channelUpdate>;

export const channelSortTypeEnum = z.enum(['createdAt', 'updatedAt', 'followerCnt']);
export type ChannelSortType = z.infer<typeof channelSortTypeEnum>;

export const channelPageResult = z.object({
  total: z.number().nonnegative().optional(),
  channels: z.array(mappedChannelDto),
});
export type ChannelPageResult = z.infer<typeof channelPageResult>;
