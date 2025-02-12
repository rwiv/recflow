import { z } from 'zod';
import { tagDto } from './tag.dto.schema.js';
import { channelEnt, channelEntAppend, channelEntUpdateForm } from '../storage/channel.entity.schema.js';
import { uuid } from '../../common/data/common.schema.js';
import { ChannelPriorityEnt, priorityEnt } from '../storage/priority.schema.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const priorityDto = priorityEnt;
export type PriorityDto = ChannelPriorityEnt;

export const channelDto = channelEnt.omit({ platformId: true, priorityId: true }).extend({
  platform: platformDto,
  priority: priorityDto,
  tags: z.array(tagDto).optional(),
});
export type ChannelDto = z.infer<typeof channelDto>;
// export interface ChannelDto {
//   id: string;
//   pid: string;
//   username: string;
//   profileImgUrl: string | null;
//   followerCnt: number;
//   followed: boolean;
//   description: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   platform: PlatformDto
//   priority: PriorityDto
//   tags?: TagDto[];
// }

export const channelAppend = channelEntAppend.omit({ platformId: true, priorityId: true }).extend({
  platformName: platformNameEnum,
  priorityName: z.string().nonempty(),
});
export type ChannelAppend = z.infer<typeof channelAppend>;

export const channelAppendWithFetch = channelAppend
  .pick({
    pid: true,
    platformName: true,
    priorityName: true,
    followed: true,
    description: true,
  })
  .extend({
    tagNames: z.array(z.string().nonempty()).optional(),
  });
export type ChannelAppendWithFetch = z.infer<typeof channelAppendWithFetch>;

export const channelAppendWithInfo = channelAppendWithFetch.pick({
  priorityName: true,
  followed: true,
  description: true,
  tagNames: true,
});
export type ChannelAppendWithInfo = z.infer<typeof channelAppendWithInfo>;

export const channelUpdateForm = channelEntUpdateForm
  .pick({
    followed: true,
    description: true,
  })
  .extend({
    priorityName: z.string().nonempty().optional(),
  });
export const channelUpdate = z.object({
  id: uuid,
  form: channelUpdateForm,
});
export type ChannelUpdate = z.infer<typeof channelUpdate>;

export const channelSortTypeEnum = z.enum(['createdAt', 'updatedAt', 'followerCnt']);
export type ChannelSortType = z.infer<typeof channelSortTypeEnum>;

export const channelPageResult = z.object({
  total: z.number().nonnegative(),
  channels: z.array(channelDto),
});
export type ChannelPageResult = z.infer<typeof channelPageResult>;
