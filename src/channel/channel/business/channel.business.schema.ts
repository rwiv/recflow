import { z } from 'zod';
import { tagRecord } from '../../tag/business/tag.business.schema.js';
import {
  channelEnt,
  channelEntAppend,
  channelEntUpdateForm,
} from '../persistence/channel.persistence.schema.js';
import { uuid } from '../../../common/data/common.schema.js';
import { ChannelPriorityEnt, priorityEnt } from '../persistence/priority.schema.js';
import {
  platformRecord,
  platformTypeEnum,
} from '../../../platform/providers/platform.business.schema.js';

export const priorityRecord = priorityEnt;
export type ChannelPriorityRecord = ChannelPriorityEnt;

export const channelRecord = channelEnt.omit({ platformId: true, priorityId: true }).extend({
  platform: platformRecord,
  priority: priorityRecord,
  tags: z.array(tagRecord).optional(),
});
export type ChannelRecord = z.infer<typeof channelRecord>;
// export interface ChannelRecord {
//   id: string;
//   pid: string;
//   username: string;
//   profileImgUrl: string | null;
//   followerCnt: number;
//   followed: boolean;
//   description: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   platform: PlatformRecord
//   priority: ChannelPriorityRecord
//   tags?: TagRecord[];
// }

export const channelAppend = channelEntAppend.omit({ platformId: true, priorityId: true }).extend({
  platformName: platformTypeEnum,
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

export const channelSortEnum = z.enum(['latest', 'followerCnt']);
export const channelSortArg = channelSortEnum.optional();
export type ChannelSortArg = z.infer<typeof channelSortArg>;

export const channelPageResult = z.object({
  total: z.number().nonnegative(),
  channels: z.array(channelRecord),
});
export type ChannelPageResult = z.infer<typeof channelPageResult>;
