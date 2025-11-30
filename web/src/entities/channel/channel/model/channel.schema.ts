import { z } from 'zod';
import { nnint, nonempty, uuid } from '@/shared/lib/schema/schema_common.ts';
import { platformDto } from '@/entities/platform/model/platform.schema.ts';
import { gradeDto } from '@/entities/channel/grade/model/grade.schema.ts';
import { tagDto } from '@/entities/channel/tag/model/tag.schema.ts';

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
