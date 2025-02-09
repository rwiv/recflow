import { z } from 'zod';
import { tagRecord } from '../../tag/business/tag.business.schema.js';
import { channelEnt } from '../persistence/channel.persistence.schema.js';
import { platformTypeEnum } from '../../../platform/platform.schema.js';
import { uuid } from '../../../common/data/common.schema.js';

export const channelRecord = channelEnt.omit({ platformId: true, priorityId: true }).extend({
  platformName: platformTypeEnum,
  priorityName: z.string().nonempty(),
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
//   platformName: PlatformType;
//   priorityName: string;
//   tags?: TagRecord[];
// }

export const chAppend = channelRecord
  .omit({ id: true })
  .partial({ profileImgUrl: true, description: true, createdAt: true, updatedAt: true });
export type ChannelAppend = z.infer<typeof chAppend>;

export const chAppendWithFetch = chAppend
  .pick({
    pid: true,
    platformName: true,
    priorityName: true,
    followed: true,
    description: true,
  })
  .extend({ tagNames: z.array(z.string().nonempty()).optional() });
export type ChannelAppendWithFetch = z.infer<typeof chAppendWithFetch>;

const chAppendWithInfo = chAppendWithFetch.pick({
  priorityName: true,
  followed: true,
  description: true,
  tagNames: true,
});
export type ChannelAppendWithInfo = z.infer<typeof chAppendWithInfo>;

const chUpdateForm = channelRecord
  .pick({
    priorityName: true,
    followed: true,
    description: true,
  })
  .partial();
export const chUpdate = z.object({
  id: uuid,
  form: chUpdateForm,
});
export type ChannelUpdate = z.infer<typeof chUpdate>;

export const chSortEnum = z.enum(['latest', 'followerCnt']);
export const chSortArg = chSortEnum.optional();
export type ChannelSortArg = z.infer<typeof chSortArg>;

export const pageQuery = z.object({
  page: z.number().int().positive(),
  size: z.number().int().nonnegative(),
});
export type PageQuery = z.infer<typeof pageQuery>;
export const pageQueryOptional = pageQuery.optional();
export type PageQueryOptional = z.infer<typeof pageQueryOptional>;

export const pageResult = z.object({
  total: z.number().nonnegative(),
  channels: z.array(channelRecord),
});
export type PageResult = z.infer<typeof pageResult>;
