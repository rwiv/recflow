import { tagDto } from '@/client/channel/tag.schema.ts';
import { platformDto } from '@/client/common/platform.schema.ts';
import { gradeDto } from '@/client/channel/grade.schema.ts';
import { z } from 'zod';
import { nnint, nonempty, uuid } from '@/common/common.schema.ts';

export const channelDto = z.object({
  id: uuid,
  sourceId: nonempty,
  username: nonempty,
  profileImgUrl: nonempty.nullable(),
  followerCnt: nnint,
  platform: platformDto,
  grade: gradeDto,
  isFollowed: z.boolean(),
  description: nonempty.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(tagDto).optional(),
});

export type ChannelDto = z.infer<typeof channelDto>;

export interface ChannelAppend {
  sourceId: string;
  platformId: string;
  gradeId: string;
  isFollowed: boolean;
  description: string | null;
  tagNames: string[];
}

export interface ChannelUpdate {
  gradeId?: string;
  isFollowed?: boolean;
  description?: string | null;
}

export interface ChannelPageResult {
  total: number;
  channels: ChannelDto[];
}
