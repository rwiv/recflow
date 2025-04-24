import { tagDto } from '@/client/channel/tag.schema.ts';
import { platformDto } from '@/client/common/platform.schema.ts';
import { priorityDto } from '@/client/channel/priority.schema.ts';
import { z } from 'zod';
import { nnint, nonempty, uuid } from '@/common/common.schema.ts';

export const channelDto = z.object({
  id: uuid,
  pid: nonempty,
  username: nonempty,
  profileImgUrl: nonempty.nullable(),
  followerCnt: nnint,
  platform: platformDto,
  priority: priorityDto,
  isFollowed: z.boolean(),
  description: nonempty.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(tagDto).optional(),
});

export type ChannelDto = z.infer<typeof channelDto>;

export interface ChannelAppend {
  pid: string;
  platformId: string;
  priorityId: string;
  isFollowed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelUpdate {
  priorityId?: string;
  isFollowed?: boolean;
  description?: string | null;
}

export interface ChannelPageResult {
  total: number;
  channels: ChannelDto[];
}
